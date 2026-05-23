import Page from './page.js';

/**
 * Page Object para la página de pago de facturas (Bill Pay)
 * URL: /billpay.htm
 */
class BillPayPage extends Page {

    // ── Datos del beneficiario ──────────────────────────────────────────────

    /** Nombre del beneficiario */
    get inputPayeeName() {
        return $('input[name="payee.name"]');
    }

    /** Dirección del beneficiario */
    get inputPayeeAddress() {
        return $('input[name="payee.address.street"]');
    }

    /** Ciudad del beneficiario */
    get inputPayeeCity() {
        return $('input[name="payee.address.city"]');
    }

    /** Estado del beneficiario */
    get inputPayeeState() {
        return $('input[name="payee.address.state"]');
    }

    /** Código postal del beneficiario */
    get inputPayeeZipCode() {
        return $('input[name="payee.address.zipCode"]');
    }

    /** Teléfono del beneficiario */
    get inputPayeePhone() {
        return $('input[name="payee.phoneNumber"]');
    }

    /** Número de cuenta del beneficiario */
    get inputPayeeAccountNumber() {
        return $('input[name="payee.accountNumber"]');
    }

    /** Verificación del número de cuenta */
    get inputVerifyAccountNumber() {
        return $('input[name="verifyAccount"]');
    }

    // ── Detalles del pago ───────────────────────────────────────────────────

    /** Monto del pago */
    get inputAmount() {
        return $('input[name="amount"]');
    }

    /** Select de cuenta de origen del pago */
    get selectFromAccount() {
        return $('select[name="fromAccountId"]');
    }

    // ── Acciones ────────────────────────────────────────────────────────────

    /** Botón para enviar el pago */
    get btnSendPayment() {
        return $('input[value="Send Payment"]');
    }

    // ── Resultados ──────────────────────────────────────────────────────────

    /** Panel de resultado exitoso */
    get successResult() {
        return $('#billpayResult');
    }

    /** Título del resultado */
    get successTitle() {
        return $('#billpayResult .title');
    }

    /** Errores de validación */
    get validationErrors() {
        return $$('.error');
    }

    /** Primer error de validación */
    get firstValidationError() {
        return $('.error');
    }

    /**
     * Navega a la página de Bill Pay
     */
    open() {
        return super.open('billpay');
    }

    /**
     * Rellena todos los campos del formulario de pago
     */
    async fillPayeeForm({ name, address, city, state, zip, phone, account, verifyAccount, amount }) {
        await this.inputPayeeName.setValue(name);
        await this.inputPayeeAddress.setValue(address);
        await this.inputPayeeCity.setValue(city);
        await this.inputPayeeState.setValue(state);
        await this.inputPayeeZipCode.setValue(zip);
        await this.inputPayeePhone.setValue(phone);
        await this.inputPayeeAccountNumber.setValue(account);
        await this.inputVerifyAccountNumber.setValue(verifyAccount);
        await this.inputAmount.setValue(amount);
    }

    /**
     * Envía el formulario de pago
     */
    async sendPayment() {
        await this.btnSendPayment.click();
    }
}

export default new BillPayPage();
