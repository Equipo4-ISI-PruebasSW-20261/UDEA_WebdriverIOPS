import Page from './page.js';

class LoanPage extends Page {

    get inputLoanAmount() {
        return $('#amount');
    }

    get inputDownPayment() {
        return $('#downPayment');
    }

    get selectFromAccount() {
        return $('#fromAccountId');
    }

    get btnApplyNow() {
        return $('input[value="Apply Now"]');
    }

    get loanResult() {
        return $('#requestLoanResult');
    }

    get loanResultTitle() {
        return $('#requestLoanResult h1.title');
    }

    get loanStatus() {
        return $('#loanStatus');
    }

    get loanRequestDenied() {
        return $('#loanRequestDenied');
    }

    get loanRequestApproved() {
        return $('#loanRequestApproved');
    }

    get loanDeniedMessage() {
        return $('#loanRequestDenied p.error');
    }

    get newAccountId() {
        return $('#newAccountId');
    }

    get loanError() {
        return $('#requestLoanError');
    }

    get errorMessage() {
        return $('.error');
    }

    open() {
        return super.open('requestloan');
    }

    async applyForLoan(amount, downPayment) {
        if (amount) await this.inputLoanAmount.setValue(amount);
        if (downPayment) await this.inputDownPayment.setValue(downPayment);
        await this.btnApplyNow.click();
    }

    async selectFirstAccount() {
        const options = await this.selectFromAccount.$$('option');
        if (options.length > 0) {
            await this.selectFromAccount.selectByIndex(0);
        }
    }

    async isApproved() {
        const text = await this.loanStatus.getText();
        return text === 'Approved';
    }

    async isDenied() {
        const text = await this.loanStatus.getText();
        return text === 'Denied';
    }
}

export default new LoanPage();
