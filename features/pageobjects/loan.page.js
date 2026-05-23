import Page from './page.js';

/**
 * Page Object para la página de solicitud de préstamo
 * URL: /requestloan.htm
 */
class LoanPage extends Page {

    /**
     * Input para el monto del préstamo solicitado
     */
    get inputLoanAmount() {
        return $('#amount');
    }

    /**
     * Input para el pago inicial (down payment)
     */
    get inputDownPayment() {
        return $('#downPayment');
    }

    /**
     * Select de cuenta donde se depositará el préstamo
     */
    get selectFromAccount() {
        return $('#fromAccountId');
    }

    /**
     * Botón para enviar la solicitud de préstamo
     */
    get btnApplyNow() {
        return $('input[value="Apply Now"]');
    }

    /**
     * Panel de resultado de la evaluación del préstamo
     */
    get loanResult() {
        return $('#loanRequestResults');
    }

    /**
     * Título del resultado (Approved / Denied)
     */
    get loanResultTitle() {
        return $('#loanRequestResults .title');
    }

    /**
     * Mensaje de resultado del préstamo
     */
    get loanResultMessage() {
        return $('#loanRequestResults p');
    }

    /**
     * Mensaje de error de validación
     */
    get errorMessage() {
        return $('.error');
    }

    /**
     * Navega a la página de solicitud de préstamo
     */
    open() {
        return super.open('requestloan');
    }

    /**
     * Completa y envía el formulario de solicitud de préstamo
     * @param {string} amount - Monto del préstamo
     * @param {string} downPayment - Pago inicial
     */
    async applyForLoan(amount, downPayment) {
        if (amount) await this.inputLoanAmount.setValue(amount);
        if (downPayment) await this.inputDownPayment.setValue(downPayment);
        await this.btnApplyNow.click();
    }

    /**
     * Selecciona la primera cuenta disponible como cuenta de depósito
     */
    async selectFirstAccount() {
        const options = await this.selectFromAccount.$$('option');
        if (options.length > 0) {
            await this.selectFromAccount.selectByIndex(0);
        }
    }

    /**
     * Verifica si el resultado contiene "Approved"
     */
    async isApproved() {
        const title = await this.loanResultTitle.getText();
        return title.includes('Approved');
    }

    /**
     * Verifica si el resultado contiene "Denied"
     */
    async isDenied() {
        const title = await this.loanResultTitle.getText();
        return title.includes('Denied');
    }
}

export default new LoanPage();
