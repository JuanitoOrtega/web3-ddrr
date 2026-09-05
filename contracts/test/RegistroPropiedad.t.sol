// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RegistroPropiedad} from "../src/RegistroPropiedad.sol";

contract RegistroPropiedadTest is Test {
    RegistroPropiedad registro;

    address admin = makeAddr("admin");
    address notario = makeAddr("notario");
    address propietario = makeAddr("propietario");
    address comprador = makeAddr("comprador");
    address estafador = makeAddr("estafador");

    string constant FOLIO = "BOL-LP-001234";
    string constant DIR = "Av. Ballivian 1234, Calacoto, La Paz";
    string constant CID = "bafkreihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku";

    function setUp() public {
        registro = new RegistroPropiedad(admin);
        vm.prank(admin);
        registro.autorizarNotario(notario);
    }

    function _emitir() internal returns (uint256) {
        vm.prank(notario);
        return registro.emitirTitulo(propietario, FOLIO, DIR, CID);
    }

    // ---------------------------------------------------------------- emisión

    function test_NotarioEmiteTitulo() public {
        uint256 tokenId = _emitir();

        assertEq(tokenId, 1);
        assertEq(registro.ownerOf(tokenId), propietario);
        assertEq(registro.totalEmitidos(), 1);
        assertEq(registro.tokenURI(tokenId), string.concat("ipfs://", CID));
    }

    function test_RevierteSiNoEsNotario() public {
        vm.prank(estafador);
        vm.expectRevert(
            abi.encodeWithSelector(RegistroPropiedad.NoEsNotario.selector, estafador)
        );
        registro.emitirTitulo(estafador, FOLIO, DIR, CID);
    }

    function test_RevierteFolioDuplicado() public {
        _emitir();
        vm.prank(notario);
        vm.expectRevert(
            abi.encodeWithSelector(RegistroPropiedad.FolioYaRegistrado.selector, FOLIO)
        );
        registro.emitirTitulo(comprador, FOLIO, DIR, CID);
    }

    // ------------------------------------------------- EL CORAZÓN DE LA DEMO

    /// El dueño legítimo tampoco puede vender por fuera del notario.
    function test_ElDuenoNoPuedeTransferir() public {
        uint256 tokenId = _emitir();

        vm.prank(propietario);
        vm.expectRevert(
            abi.encodeWithSelector(
                RegistroPropiedad.TransferenciaNoAutorizada.selector, propietario
            )
        );
        registro.transferFrom(propietario, estafador, tokenId);

        assertEq(registro.ownerOf(tokenId), propietario, "el titulo no se movio");
    }

    function test_TerceroNoPuedeTransferir() public {
        uint256 tokenId = _emitir();

        vm.prank(estafador);
        vm.expectRevert(
            abi.encodeWithSelector(
                RegistroPropiedad.TransferenciaNoAutorizada.selector, estafador
            )
        );
        registro.transferFrom(propietario, estafador, tokenId);
    }

    function test_SafeTransferTambienRevierte() public {
        uint256 tokenId = _emitir();

        vm.prank(propietario);
        vm.expectRevert(
            abi.encodeWithSelector(
                RegistroPropiedad.TransferenciaNoAutorizada.selector, propietario
            )
        );
        registro.safeTransferFrom(propietario, estafador, tokenId);
    }

    function test_AprobacionesDeshabilitadas() public {
        uint256 tokenId = _emitir();

        vm.prank(propietario);
        vm.expectRevert(RegistroPropiedad.AprobacionDeshabilitada.selector);
        registro.approve(estafador, tokenId);

        vm.prank(propietario);
        vm.expectRevert(RegistroPropiedad.AprobacionDeshabilitada.selector);
        registro.setApprovalForAll(estafador, true);
    }

    // --------------------------------------------------------------- traspaso

    function test_NotarioTransfiere() public {
        uint256 tokenId = _emitir();

        vm.prank(notario);
        registro.transferirPorNotario(tokenId, comprador);

        assertEq(registro.ownerOf(tokenId), comprador);
        assertTrue(registro.esTitular(FOLIO, comprador));
        assertFalse(registro.esTitular(FOLIO, propietario));
    }

    function test_NotarioRevocadoYaNoTransfiere() public {
        uint256 tokenId = _emitir();

        vm.prank(admin);
        registro.revocarNotario(notario);

        vm.prank(notario);
        vm.expectRevert(
            abi.encodeWithSelector(RegistroPropiedad.NoEsNotario.selector, notario)
        );
        registro.transferirPorNotario(tokenId, comprador);
    }

    function test_RevierteTituloInexistente() public {
        vm.prank(notario);
        vm.expectRevert(RegistroPropiedad.TituloNoExiste.selector);
        registro.transferirPorNotario(999, comprador);
    }

    // -------------------------------------------------------------- consultas

    /// El escenario exacto de la demo: el estafador NO figura como titular.
    function test_VerificacionDeFraude() public {
        _emitir();

        assertTrue(registro.esTitular(FOLIO, propietario), "el dueno real si figura");
        assertFalse(registro.esTitular(FOLIO, estafador), "el estafador no figura");
        assertFalse(registro.esTitular("BOL-LP-999999", propietario), "folio inventado");
    }

    function test_ConsultarPorFolio() public {
        _emitir();

        (
            bool existe,
            uint256 tokenId,
            address duenoActual,
            string memory direccion,
            string memory cid,
        ) = registro.consultarPorFolio(FOLIO);

        assertTrue(existe);
        assertEq(tokenId, 1);
        assertEq(duenoActual, propietario);
        assertEq(direccion, DIR);
        assertEq(cid, CID);
    }

    function test_ConsultarFolioInexistente() public view {
        (bool existe,,,,,) = registro.consultarPorFolio("BOL-SC-000000");
        assertFalse(existe);
    }

    function testFuzz_CualquieraQueNoSeaNotarioFalla(address quien) public {
        vm.assume(quien != notario && quien != admin && quien != address(0));
        uint256 tokenId = _emitir();

        vm.prank(quien);
        vm.expectRevert();
        registro.transferFrom(propietario, quien, tokenId);
    }
}
