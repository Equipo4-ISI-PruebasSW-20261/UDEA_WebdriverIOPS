Feature: Transferencias entre Cuentas en Parabank
  Como usuario autenticado
  Quiero transferir fondos entre mis cuentas
  Para administrar mi dinero de forma flexible

  Background:
    Given I am logged in as "john" with password "demo"

  @transfer
  Scenario: El usuario puede ver el formulario de transferencia con cuentas disponibles
    When I navigate to the transfer funds page
    Then I should see the transfer form with source and destination account selectors

  @transfer
  Scenario: Transferencia exitosa entre cuentas propias
    When I navigate to the transfer funds page
    And I enter a transfer amount of "100"
    And I select different source and destination accounts
    And I click the transfer button
    Then I should see a transfer confirmation message "Transfer Complete!"

  @transfer
  Scenario: Transferencia con monto cero muestra error
    When I navigate to the transfer funds page
    And I enter a transfer amount of "0"
    And I select different source and destination accounts
    And I click the transfer button
    Then I should see a transfer error or validation message

  @transfer
  Scenario: Transferencia con monto muy alto muestra error de fondos insuficientes
    When I navigate to the transfer funds page
    And I enter a transfer amount of "99999999"
    And I select different source and destination accounts
    And I click the transfer button
    Then I should see a transfer error or validation message
