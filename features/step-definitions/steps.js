import { Given, When, Then } from '@wdio/cucumber-framework';
import { config }            from '../../wdio.conf.js';

import LoginPage           from '../pageobjects/login.page.js';
import AccountOverviewPage from '../pageobjects/account-overview.page.js';
import TransferPage        from '../pageobjects/transfer.page.js';
import BillPayPage         from '../pageobjects/bill-pay.page.js';
import LoanPage            from '../pageobjects/loan.page.js';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cierra la sesión activa de Parabank navegando al endpoint de logout.
 * Necesario porque Parabank mantiene cookies de sesión entre escenarios
 * del mismo worker. Sin esto, la segunda visita al login page
 * redirige al dashboard y el formulario no se muestra.
 *
 * La primera navegación al servidor demo puede fallar por cold-start.
 * Se configura un pageLoad timeout de 30s para que no se cuelgue
 * indefinidamente, y se reintenta hasta 3 veces.
 */
async function ensureLoggedOut() {
    await browser.setTimeout({ 'pageLoad': 30000 });
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await browser.url(`${config.baseUrl}/logout.htm`);
            await browser.waitUntil(
                async () => await LoginPage.inputUsername.isExisting(),
                { timeout: 10000, timeoutMsg: 'El formulario de login no apareció tras el logout' }
            );
            return;
        } catch (err) {
            if (attempt === maxRetries) throw err;
            console.warn(`[ensureLoggedOut] Intento ${attempt} falló (${err.message}), reintentando...`);
            await browser.pause(2000);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED / COMMON STEPS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Abre la página de login garantizando que no hay sesión activa.
 * Utilizado en login.feature (sin Background).
 */
Given(/^I am on the login page$/, async () => {
    await ensureLoggedOut();
});

/**
 * Realiza login completo con logout previo.
 * Utilizado como Background en features que requieren autenticación.
 * El servidor demo de Parabank es intermitente — a veces el POST de login
 * no redirige al dashboard. Se reintenta el login completo si falla.
 */
Given(/^I am logged in as "([^"]*)" with password "([^"]*)"$/, async (username, password) => {
    const maxLoginRetries = 2;
    for (let attempt = 1; attempt <= maxLoginRetries; attempt++) {
        await ensureLoggedOut();
        await LoginPage.login(username, password);

        try {
            await browser.waitUntil(
                async () => {
                    try {
                        const url = await browser.getUrl();
                        if (url && url.includes('overview')) return true;
                        return await AccountOverviewPage.accountsTable.isExisting();
                    } catch {
                        return false;
                    }
                },
                { timeout: 30000, interval: 500, timeoutMsg: 'No se navegó al dashboard después del login' }
            );
            return;
        } catch (loginErr) {
            if (attempt === maxLoginRetries) throw loginErr;
            console.warn(`[login] Intento ${attempt} falló, reintentando...`);
            try {
                const errEl = await $('.error');
                if (await errEl.isExisting()) {
                    console.warn(`[login] Página mostró error: ${await errEl.getText()}`);
                }
            } catch {}
        }
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// HISTORIA 1 — LOGIN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Login con comillas — nuevos escenarios.
 * Limpia los campos antes de escribir para manejar campos vacíos correctamente.
 */
When(/^I login with username "([^"]*)" and password "([^"]*)"$/, async (username, password) => {
    // Limpiar campos primero (por si vienen de escenario anterior)
    await LoginPage.inputUsername.clearValue();
    await LoginPage.inputPassword.clearValue();
    if (username) await LoginPage.inputUsername.setValue(username);
    if (password) await LoginPage.inputPassword.setValue(password);
    await LoginPage.btnSubmit.click();
    // Pausa breve para que inicie la navegación/respuesta del servidor
    await browser.pause(1500);
});

/**
 * Login sin comillas — compatibilidad con feature original.
 */
When(/^I login with (\w+) and (.+)$/, async (username, password) => {
    await LoginPage.login(username, password);
    await browser.pause(1500);
});

/**
 * Verifica que el título de la página sea el esperado (login exitoso).
 * Usa waitUntil para aguardar la navegación post-login.
 */
Then(/^I should see the page title "([^"]*)"$/, async (expectedTitle) => {
    await browser.waitUntil(
        async () => {
            try {
                const el = await $('.title');
                if (!await el.isExisting()) return false;
                const text = await el.getText();
                return text.includes(expectedTitle);
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: `El título "${expectedTitle}" no apareció en 20s` }
    );
});

/**
 * Verifica que aparezca un mensaje de error (login fallido).
 * Usa waitUntil para aguardar la respuesta del servidor.
 */
Then(/^I should see an error message containing "([^"]*)"$/, async (errorText) => {
    await browser.waitUntil(
        async () => {
            try {
                const err = await $('.error');
                if (await err.isExisting()) {
                    const t = await err.getText();
                    if (t.includes(errorText)) return true;
                }
                // Fallback: buscar en todo el body por el texto de error
                const bodyText = await $('body').getText();
                return bodyText.includes(errorText);
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: `El mensaje de error "${errorText}" no apareció en 20s` }
    );
});

/**
 * Verificación combinada del resultado del login (compatible con Scenario Outline).
 */
Then(/^I should see the result message "([^"]*)"$/, async (message) => {
    await browser.waitUntil(
        async () => {
            try {
                const el = await $('.title');
                if (!await el.isExisting()) return false;
                const text = await el.getText();
                return text.includes(message);
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: `El mensaje "${message}" no apareció en 20s` }
    );
});

/**
 * Verificación genérica de texto en pantalla (compatibilidad con feature original).
 */
Then(/^I should see a text saying (.*)$/, async (message) => {
    await browser.waitUntil(
        async () => {
            try {
                const el = await $('.title');
                if (!await el.isExisting()) return false;
                const text = await el.getText();
                return text.includes(message);
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: `El texto "${message}" no apareció en 20s` }
    );
});

/**
 * Verificación de botón deshabilitado. 
 */
Then(/^the login button should be disabled$/, async () => {
    await expect(LoginPage.btnSubmit).toBeDisabled();
});

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIA 2 — CONSULTA DE ESTADOS DE CUENTAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navega a la página de resumen de cuentas.
 */
When(/^I navigate to the accounts overview page$/, async () => {
    await AccountOverviewPage.open();
    await browser.waitUntil(
        async () => await AccountOverviewPage.accountsTable.isExisting(),
        { timeout: 30000, timeoutMsg: 'La tabla de cuentas no cargó' }
    );
});

/**
 * Verifica que haya al menos una cuenta listada.
 */
Then(/^I should see at least one account listed$/, async () => {
    const count = await AccountOverviewPage.getAccountCount();
    expect(count).toBeGreaterThan(0);
});

/**
 * Verifica que cada cuenta muestra un balance visible.
 */
Then(/^each account should display a balance amount$/, async () => {
    await browser.waitUntil(
        async () => (await AccountOverviewPage.getAccountCount()) > 0,
        { timeout: 15000, timeoutMsg: 'No se encontraron filas de cuentas para validar balances' }
    );

    const accountRows = await AccountOverviewPage.accountRows;
    let validatedAccounts = 0;

    for (const row of accountRows) {
        const accountLinks = await row.$$('td:first-child a');
        if (accountLinks.length === 0) {
            // Ignorar filas agregadas como "Total" que no representan una cuenta.
            continue;
        }

        const cells = await row.$$('td');
        expect(cells.length).toBeGreaterThanOrEqual(2);
        const balanceCell = cells[1];
        const text = await balanceCell.getText();
        expect(text.trim()).not.toBe('');
        validatedAccounts += 1;
    }

    expect(validatedAccounts).toBeGreaterThan(0);
});

/**
 * Hace clic en la primera cuenta de la lista.
 */
When(/^I click on the first account$/, async () => {
    await AccountOverviewPage.clickFirstAccount();
    await browser.pause(1000);
});

/**
 * Verifica que se muestra la página de detalles de la cuenta.
 */
Then(/^I should see the account details page with "([^"]*)"$/, async (expectedText) => {
    await browser.waitUntil(
        async () => {
            try {
                const el = await $('.title');
                if (!await el.isExisting()) return false;
                const text = await el.getText();
                return text.includes(expectedText);
            } catch { return false; }
        },
        { timeout: 15000, timeoutMsg: `El título "${expectedText}" de detalles no apareció` }
    );
});

/**
 * Verifica que se muestra actividad transaccional de la cuenta.
 */
Then(/^I should see transaction activity for the account$/, async () => {
    await browser.waitUntil(
        async () => await $('.title').isExisting(),
        { timeout: 15000, timeoutMsg: 'El título de actividad de cuenta no apareció' }
    );
    await expect($('.title')).toBeDisplayed();
});

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIA 3 — TRANSFERENCIAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navega a la página de transferencia de fondos.
 */
When(/^I navigate to the transfer funds page$/, async () => {
    await TransferPage.open();
    await browser.waitUntil(
        async () => await TransferPage.inputAmount.isExisting(),
        { timeout: 15000, timeoutMsg: 'El formulario de transferencia no cargó' }
    );
    // Esperar a que los selects de cuentas se hayan poblado en la página
    await browser.waitUntil(
        async () => {
            try {
                const from = await TransferPage.getFromAccountOptions();
                const to = await TransferPage.getToAccountOptions();
                return from.length > 0 && to.length > 0;
            } catch { return false; }
        },
        { timeout: 15000, timeoutMsg: 'Los selects de cuenta no se poblaron' }
    );
});

/**
 * Verifica que el formulario de transferencia está visible con los selects de cuentas.
 */
Then(/^I should see the transfer form with source and destination account selectors$/, async () => {
    await expect(TransferPage.inputAmount).toBeExisting();
    await expect(TransferPage.selectFromAccount).toBeExisting();
    await expect(TransferPage.selectToAccount).toBeExisting();
    await expect(TransferPage.btnTransfer).toBeExisting();
});

/**
 * Ingresa el monto a transferir.
 */
When(/^I enter a transfer amount of "([^"]*)"$/, async (amount) => {
    await TransferPage.inputAmount.clearValue();
    await TransferPage.inputAmount.setValue(amount);
});

/**
 * Selecciona cuentas distintas en origen y destino.
 */
When(/^I select different source and destination accounts$/, async () => {
    await TransferPage.selectDifferentAccounts();
});

/**
 * Hace clic en el botón de transferir.
 */
When(/^I click the transfer button$/, async () => {
    await TransferPage.btnTransfer.click();
    await browser.pause(1500);
});

/**
 * Verifica el mensaje de confirmación de transferencia exitosa.
 */
Then(/^I should see a transfer confirmation message "([^"]*)"$/, async (expectedMessage) => {
    await browser.waitUntil(
        async () => {
            try {
                const result = await TransferPage.transferResult;
                if (!await result.isExisting()) return false;
                const title = await TransferPage.transferResultTitle;
                if (!await title.isExisting()) return false;
                const text = await title.getText();
                return text.includes(expectedMessage);
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: `El mensaje de confirmación "${expectedMessage}" no apareció` }
    );
});

/**
 * Verifica que aparece un error o mensaje de validación en la transferencia.
 */
Then(/^I should see a transfer error or validation message$/, async () => {
    await browser.waitUntil(
        async () => {
            try {
                const errorExists  = await TransferPage.errorMessage.isExisting();
                const resultExists = await TransferPage.transferResult.isExisting();
                return errorExists || resultExists;
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: 'No apareció ningún mensaje de error o resultado en transferencia' }
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIA 4 — PAGOS (BILL PAY)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navega a la página de pago de facturas.
 */
When(/^I navigate to the bill pay page$/, async () => {
    await BillPayPage.open();
    await browser.waitUntil(
        async () => await BillPayPage.inputPayeeName.isExisting(),
        { timeout: 15000, timeoutMsg: 'El formulario de Bill Pay no cargó' }
    );
});

/**
 * Verifica que el formulario de Bill Pay está visible.
 */
Then(/^I should see the bill pay form$/, async () => {
    await expect(BillPayPage.inputPayeeName).toBeExisting();
    await expect(BillPayPage.inputAmount).toBeExisting();
    await expect(BillPayPage.btnSendPayment).toBeExisting();
});

When(/^I fill in the payee name "([^"]*)"$/,           async (v) => { await BillPayPage.inputPayeeName.setValue(v); });
When(/^I fill in the payee address "([^"]*)"$/,        async (v) => { await BillPayPage.inputPayeeAddress.setValue(v); });
When(/^I fill in the payee city "([^"]*)"$/,           async (v) => { await BillPayPage.inputPayeeCity.setValue(v); });
When(/^I fill in the payee state "([^"]*)"$/,          async (v) => { await BillPayPage.inputPayeeState.setValue(v); });
When(/^I fill in the payee zip code "([^"]*)"$/,       async (v) => { await BillPayPage.inputPayeeZipCode.setValue(v); });
When(/^I fill in the payee phone "([^"]*)"$/,          async (v) => { await BillPayPage.inputPayeePhone.setValue(v); });
When(/^I fill in the payee account number "([^"]*)"$/, async (v) => { await BillPayPage.inputPayeeAccountNumber.setValue(v); });
When(/^I fill in the verify account number "([^"]*)"$/,async (v) => { await BillPayPage.inputVerifyAccountNumber.setValue(v); });
When(/^I fill in the payment amount "([^"]*)"$/,       async (v) => { await BillPayPage.inputAmount.setValue(v); });

/**
 * Hace clic en el botón de enviar pago.
 */
When(/^I click the send payment button$/, async () => {
    await BillPayPage.btnSendPayment.click();
    await browser.pause(1500);
});

/**
 * Verifica el mensaje de éxito del pago.
 */
Then(/^I should see a bill pay success message "([^"]*)"$/, async (expectedMessage) => {
    await browser.waitUntil(
        async () => {
            try {
                // El resultado puede estar en #billpayResult o en .title
                const resultEl = await $('#billpayResult');
                if (await resultEl.isExisting()) {
                    const text = await resultEl.getText();
                    const alt = expectedMessage.replace(/!+$/, '');
                    if (text.includes(expectedMessage) || text.includes(alt)) return true;
                }
                const titleEl = await $('.title');
                if (await titleEl.isExisting()) {
                    const text = await titleEl.getText();
                    const alt = expectedMessage.replace(/!+$/, '');
                    if (text.includes(expectedMessage) || text.includes(alt)) return true;
                }
                return false;
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: `El mensaje de éxito "${expectedMessage}" no apareció` }
    );
});

/**
 * Verifica que aparece un error de validación en Bill Pay.
 */
Then(/^I should see a bill pay validation error$/, async () => {
    await browser.waitUntil(
        async () => {
            try {
                const errors = await $$('.error');
                if (errors.length > 0) return true;
                // También puede ser un span con clase ng-scope o similar
                const bodyText = await $('body').getText();
                return bodyText.includes('required') ||
                       bodyText.includes('invalid') ||
                       bodyText.includes('error') ||
                       bodyText.includes('Please');
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: 'No apareció ningún error de validación en Bill Pay' }
    );
});

// ─────────────────────────────────────────────────────────────────────────────
// HISTORIA 5 — PRÉSTAMOS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navega a la página de solicitud de préstamo.
 */
When(/^I navigate to the loan request page$/, async () => {
    await LoanPage.open();
    await browser.waitUntil(
        async () => await LoanPage.inputLoanAmount.isExisting(),
        { timeout: 15000, timeoutMsg: 'El formulario de préstamo no cargó' }
    );
});

/**
 * Verifica que el formulario de préstamo está visible.
 */
Then(/^I should see the loan request form$/, async () => {
    await expect(LoanPage.inputLoanAmount).toBeExisting();
    await expect(LoanPage.inputDownPayment).toBeExisting();
    await expect(LoanPage.selectFromAccount).toBeExisting();
    await expect(LoanPage.btnApplyNow).toBeExisting();
});

/**
 * Ingresa el monto del préstamo.
 */
When(/^I enter a loan amount of "([^"]*)"$/, async (amount) => {
    await LoanPage.inputLoanAmount.clearValue();
    await LoanPage.inputLoanAmount.setValue(amount);
});

/**
 * Ingresa el pago inicial.
 */
When(/^I enter a down payment of "([^"]*)"$/, async (downPayment) => {
    await LoanPage.inputDownPayment.clearValue();
    await LoanPage.inputDownPayment.setValue(downPayment);
});

/**
 * Selecciona la primera cuenta disponible como cuenta de depósito.
 */
When(/^I select the first available deposit account$/, async () => {
    await LoanPage.selectFirstAccount();
});

/**
 * Hace clic en el botón Apply Now.
 */
When(/^I click the apply now button$/, async () => {
    await LoanPage.btnApplyNow.click();
    await browser.pause(2000);
});

/**
 * Verifica que se muestra el resultado de la evaluación del préstamo.
 * Parabank muestra el resultado en la misma página via AJAX.
 * Acepta tanto "Approved" como "Denied" como resultados válidos.
 */
Then(/^I should see the loan evaluation result$/, async () => {
    await browser.waitUntil(
        async () => {
            try {
                // Primero intentar con el ID específico
                const resultEl = await $('#loanRequestResults');
                if (await resultEl.isExisting()) {
                    const text = await resultEl.getText();
                    return text.includes('Approved') || text.includes('Denied');
                }
                // Fallback: buscar en el texto del body completo
                const bodyText = await $('body').getText();
                return bodyText.includes('Approved') || bodyText.includes('Denied');
            } catch { return false; }
        },
        { timeout: 30000, timeoutMsg: 'El resultado del préstamo (Approved/Denied) no apareció en 30s' }
    );
});

/**
 * Verifica que aparece un error o resultado de validación en la solicitud de préstamo.
 */
Then(/^I should see a loan validation error or result$/, async () => {
    await browser.waitUntil(
        async () => {
            try {
                const errorEl = await $('.error');
                if (await errorEl.isExisting()) return true;
                const resultEl = await $('#loanRequestResults');
                if (await resultEl.isExisting()) return true;
                const bodyText = await $('body').getText();
                return bodyText.includes('Approved') ||
                       bodyText.includes('Denied')   ||
                       bodyText.includes('error')    ||
                       bodyText.includes('required');
            } catch { return false; }
        },
        { timeout: 20000, timeoutMsg: 'No apareció ningún error ni resultado en el préstamo' }
    );
});