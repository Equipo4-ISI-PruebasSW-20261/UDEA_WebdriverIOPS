import Page from './page.js';

/**
 * Page Object para la página de resumen de cuentas (Account Overview)
 * URL: /overview.htm
 */
class AccountOverviewPage extends Page {

    /**
     * Tabla principal con el listado de cuentas del usuario
     */
    get accountsTable() {
        return $('table#accountTable');
    }

    /**
     * Todas las filas de cuentas (excluyendo el encabezado)
     */
    get accountRows() {
        return $$('table#accountTable tbody tr');
    }

    /**
     * Primer enlace de cuenta en la tabla
     */
    get firstAccountLink() {
        return $('table#accountTable tbody tr:first-child td:first-child a');
    }

    /**
     * Todos los enlaces de cuentas
     */
    get allAccountLinks() {
        return $$('table#accountTable tbody tr td:first-child a');
    }

    /**
     * Todos los balances de cuentas
     */
    get allBalanceCells() {
        return $$('table#accountTable tbody tr td:nth-child(2)');
    }

    /**
     * Título de la página actual
     */
    get pageTitle() {
        return $('.title');
    }

    /**
     * Navega a la página de resumen de cuentas
     */
    open() {
        return super.open('overview');
    }

    /**
     * Obtiene el número de cuentas listadas
     */
    async getAccountCount() {
        try {
            await browser.waitUntil(
                async () => (await this.accountRows).length > 0,
                { timeout: 10000 }
            );
        } catch {
            // ignore timeout — will return current length (may be 0)
        }
        const rows = await this.accountRows;
        return rows.length;
    }

    /**
     * Hace clic en el enlace de la primera cuenta
     */
    async clickFirstAccount() {
        await this.firstAccountLink.click();
    }

    /**
     * Verifica que todas las celdas de balance contienen un valor monetario
     */
    async allBalancesVisible() {
        const balances = await this.allBalanceCells;
        for (const cell of balances) {
            const text = await cell.getText();
            if (!text || text.trim() === '') return false;
        }
        return true;
    }
}

export default new AccountOverviewPage();
