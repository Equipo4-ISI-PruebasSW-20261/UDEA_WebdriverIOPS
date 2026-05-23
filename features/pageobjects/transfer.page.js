import Page from './page.js';

/**
 * Page Object para la página de transferencia de fondos
 * URL: /transfer.htm
 */
class TransferPage extends Page {

    /**
     * Input para el monto a transferir
     */
    get inputAmount() {
        return $('#amount');
    }

    /**
     * Select de cuenta origen
     */
    get selectFromAccount() {
        return $('#fromAccountId');
    }

    /**
     * Select de cuenta destino
     */
    get selectToAccount() {
        return $('#toAccountId');
    }

    /**
     * Botón para ejecutar la transferencia
     */
    get btnTransfer() {
        return $('input[value="Transfer"]');
    }

    /**
     * Mensaje de éxito de transferencia
     */
    get transferResult() {
        return $('#showResult');
    }

    /**
     * Título del resultado de transferencia
     */
    get transferResultTitle() {
        return $('#showResult h1.title');
    }

    /**
     * Mensaje de error
     */
    get errorMessage() {
        return $('.error');
    }

    /**
     * Título de la página
     */
    get pageTitle() {
        return $('.title');
    }

    /**
     * Navega a la página de transferencia
     */
    open() {
        return super.open('transfer');
    }

    /**
     * Ejecuta una transferencia completa
     * @param {string} amount - Monto a transferir
     */
    async transferFunds(amount) {
        await this.inputAmount.setValue(amount);
        await this.btnTransfer.click();
    }

    /**
     * Obtiene las opciones del select de cuenta origen
     */
    async getFromAccountOptions() {
        return await this.selectFromAccount.$$('option');
    }

    /**
     * Obtiene las opciones del select de cuenta destino
     */
    async getToAccountOptions() {
        return await this.selectToAccount.$$('option');
    }

    /**
     * Selecciona cuentas distintas para origen y destino
     */
    async selectDifferentAccounts() {
        const fromOptions = await this.getFromAccountOptions();
        const toOptions = await this.getToAccountOptions();

        if (fromOptions.length >= 1) {
            await this.selectFromAccount.selectByIndex(0);
        }
        if (toOptions.length >= 2) {
            await this.selectToAccount.selectByIndex(1);
        } else if (toOptions.length >= 1) {
            await this.selectToAccount.selectByIndex(0);
        }
    }
}

export default new TransferPage();
