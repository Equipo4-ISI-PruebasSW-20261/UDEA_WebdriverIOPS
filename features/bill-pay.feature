Feature: Pagos a Beneficiarios en Parabank
  Como usuario autenticado
  Quiero realizar pagos a beneficiarios
  Para cumplir con mis compromisos financieros

  Background:
    Given I am logged in as "john" with password "demo"

  @billpay
  Scenario: El usuario puede ver el formulario de pago
    When I navigate to the bill pay page
    Then I should see the bill pay form

  @billpay
  Scenario: Pago exitoso a un beneficiario con datos completos
    When I navigate to the bill pay page
    And I fill in the payee name "Juan Perez"
    And I fill in the payee address "Calle 123"
    And I fill in the payee city "Medellin"
    And I fill in the payee state "ANT"
    And I fill in the payee zip code "050001"
    And I fill in the payee phone "3001234567"
    And I fill in the payee account number "13344"
    And I fill in the verify account number "13344"
    And I fill in the payment amount "50"
    Then the payment confirmation should show amount "50" and payee "Juan Perez"
    When I click the send payment button
    Then I should see a bill pay success message "Bill Payment Complete!"

  @billpay
  Scenario: Pago con campos vacíos muestra error de validación
    When I navigate to the bill pay page
    And I click the send payment button
    Then I should see a bill pay validation error

  @billpay
  Scenario: Pago con cuentas de beneficiario no coincidentes muestra error
    When I navigate to the bill pay page
    And I fill in the payee name "Test User"
    And I fill in the payee address "Calle 456"
    And I fill in the payee city "Bogota"
    And I fill in the payee state "CUN"
    And I fill in the payee zip code "110111"
    And I fill in the payee phone "3109876543"
    And I fill in the payee account number "11111"
    And I fill in the verify account number "99999"
    And I fill in the payment amount "25"
    And I click the send payment button
    Then I should see a bill pay validation error
