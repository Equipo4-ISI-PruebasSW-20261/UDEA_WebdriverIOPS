Feature: Consulta de Estados de Cuentas en Parabank
  Como usuario autenticado
  Quiero ver los estados de mis cuentas
  Para conocer mi saldo y los movimientos recientes

  Background:
    Given I am logged in as "john" with password "demo"

  @accounts
  Scenario: Se muestran todas las cuentas del usuario
    When I navigate to the accounts overview page
    Then I should see at least one account listed

  @accounts
  Scenario: Cada cuenta muestra el balance actual
    When I navigate to the accounts overview page
    Then each account should display a balance amount

  @accounts
  Scenario: El usuario puede hacer clic en una cuenta para ver detalles
    When I navigate to the accounts overview page
    And I click on the first account
    Then I should see the account details page with "Account Details"

  @accounts
  Scenario: La información se actualiza al seleccionar diferente cuenta
    When I navigate to the accounts overview page
    And I click on the first account
    And I note the current account id
    And I navigate to the accounts overview page
    And I click on account at index 1
    Then the current account id should be different
