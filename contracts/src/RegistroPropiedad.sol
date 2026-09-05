// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Registro de Propiedad — capa de validación paralela a Derechos Reales
/// @notice Cada título de propiedad es un ERC-721 que su propio dueño NO puede
///         transferir. Solo un notario autorizado mueve la titularidad, igual que
///         en el registro físico. Verificar es gratis y sin permisos.
contract RegistroPropiedad is ERC721, Ownable {
    struct Titulo {
        string folioReal;
        string direccion;
        string cid; // CID de IPFS del PDF del testimonio
        address notarioEmisor;
        uint64 emitidoEn;
    }

    uint256 private _siguienteId = 1;

    mapping(uint256 tokenId => Titulo) private _titulos;
    mapping(bytes32 folioHash => uint256 tokenId) private _folioATokenId;
    mapping(address cuenta => bool) public esNotario;

    error NoEsNotario(address quien);
    error TransferenciaNoAutorizada(address quien);
    error FolioYaRegistrado(string folioReal);
    error TituloNoExiste();
    error DireccionInvalida();
    error AprobacionDeshabilitada();

    event NotarioAutorizado(address indexed notario);
    event NotarioRevocado(address indexed notario);
    event TituloEmitido(
        uint256 indexed tokenId,
        bytes32 indexed folioHash,
        address indexed propietario,
        string folioReal,
        string direccion,
        string cid,
        address notario
    );
    event TituloTransferido(
        uint256 indexed tokenId,
        address indexed anterior,
        address indexed nuevo,
        address notario
    );

    modifier soloNotario() {
        if (!esNotario[_msgSender()]) revert NoEsNotario(_msgSender());
        _;
    }

    constructor(address admin) ERC721("Registro DDRR Bolivia", "DDRR") Ownable(admin) {
        // El admin arranca como notario para poder sembrar la demo sin pasos extra.
        esNotario[admin] = true;
        emit NotarioAutorizado(admin);
    }

    // --------------------------------------------------------------------
    // Notarios
    // --------------------------------------------------------------------

    function autorizarNotario(address notario) external onlyOwner {
        if (notario == address(0)) revert DireccionInvalida();
        esNotario[notario] = true;
        emit NotarioAutorizado(notario);
    }

    function revocarNotario(address notario) external onlyOwner {
        esNotario[notario] = false;
        emit NotarioRevocado(notario);
    }

    // --------------------------------------------------------------------
    // Emisión y traspaso
    // --------------------------------------------------------------------

    function emitirTitulo(
        address propietario,
        string calldata folioReal,
        string calldata direccion,
        string calldata cid
    ) external soloNotario returns (uint256 tokenId) {
        if (propietario == address(0)) revert DireccionInvalida();

        bytes32 folioHash = keccak256(bytes(folioReal));
        if (_folioATokenId[folioHash] != 0) revert FolioYaRegistrado(folioReal);

        tokenId = _siguienteId++;
        _folioATokenId[folioHash] = tokenId;
        _titulos[tokenId] = Titulo({
            folioReal: folioReal,
            direccion: direccion,
            cid: cid,
            notarioEmisor: _msgSender(),
            emitidoEn: uint64(block.timestamp)
        });

        _mint(propietario, tokenId);

        emit TituloEmitido(
            tokenId, folioHash, propietario, folioReal, direccion, cid, _msgSender()
        );
    }

    /// @notice Única vía legítima para cambiar de dueño.
    function transferirPorNotario(uint256 tokenId, address nuevoPropietario)
        external
        soloNotario
    {
        if (nuevoPropietario == address(0)) revert DireccionInvalida();
        if (_ownerOf(tokenId) == address(0)) revert TituloNoExiste();

        address anterior = _update(nuevoPropietario, tokenId, address(0));
        emit TituloTransferido(tokenId, anterior, nuevoPropietario, _msgSender());
    }

    // --------------------------------------------------------------------
    // Consulta pública — gratis, sin wallet, sin permisos
    // --------------------------------------------------------------------

    /// @notice La pregunta que hace el comprador: ¿este vendedor es el dueño?
    function esTitular(string calldata folioReal, address quien)
        external
        view
        returns (bool)
    {
        uint256 tokenId = _folioATokenId[keccak256(bytes(folioReal))];
        if (tokenId == 0) return false;
        return _ownerOf(tokenId) == quien;
    }

    function consultarPorFolio(string calldata folioReal)
        external
        view
        returns (
            bool existe,
            uint256 tokenId,
            address propietario,
            string memory direccion,
            string memory cid,
            uint64 emitidoEn
        )
    {
        tokenId = _folioATokenId[keccak256(bytes(folioReal))];
        if (tokenId == 0) return (false, 0, address(0), "", "", 0);

        Titulo storage t = _titulos[tokenId];
        return (true, tokenId, _ownerOf(tokenId), t.direccion, t.cid, t.emitidoEn);
    }

    function titulo(uint256 tokenId) external view returns (Titulo memory) {
        if (_ownerOf(tokenId) == address(0)) revert TituloNoExiste();
        return _titulos[tokenId];
    }

    function totalEmitidos() external view returns (uint256) {
        return _siguienteId - 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert TituloNoExiste();
        return string.concat("ipfs://", _titulos[tokenId].cid);
    }

    // --------------------------------------------------------------------
    // El corazón: el título no se transfiere solo
    // --------------------------------------------------------------------

    /// @dev Hook único de OZ v5. Permite la emisión (from == 0) y bloquea
    ///      cualquier movimiento posterior que no venga de un notario.
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && !esNotario[_msgSender()]) {
            revert TransferenciaNoAutorizada(_msgSender());
        }
        return super._update(to, tokenId, auth);
    }

    /// @dev Sin aprobaciones: un título no se lista en un marketplace.
    function approve(address, uint256) public pure override {
        revert AprobacionDeshabilitada();
    }

    function setApprovalForAll(address, bool) public pure override {
        revert AprobacionDeshabilitada();
    }
}
