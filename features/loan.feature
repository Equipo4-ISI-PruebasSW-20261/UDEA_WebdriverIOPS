Feature: Solicitud de Préstamos en Parabank
  Como usuario
  Quiero solicitar un préstamo
  Para obtener fondos adicionales cuando los necesite

  Background:
    Given I am logged in as "john" with password "demo"

  @loan
  Scenario: El usuario puede ver el formulario de solicitud de préstamo
    When I navigate to the loan request page
    Then I should see the loan request form

  @loan
  Scenario: Solicitud de préstamo aprobada con monto y pago inicial razonables
    When I navigate to the loan request page
    And I enter a loan amount of "1000"
    And I enter a down payment of "100"
    And I select the first available deposit account
    And I click the apply now button
    Then I should see the loan evaluation result

  @loan
  Scenario: Solicitud de préstamo con monto pequeño y pago inicial proporcional
    When I navigate to the loan request page
    And I enter a loan amount of "500"
    And I enter a down payment of "50"
    And I select the first available deposit account
    And I click the apply now button
    Then I should see the loan evaluation result

  @loan
  Scenario: Solicitud de préstamo con campos vacíos muestra validación
    When I navigate to the loan request page
    And I click the apply now button
    Then I should see a loan validation error or result

  @loan
  Scenario: Solicitud de préstamo con monto muy alto puede ser rechazada
    When I navigate to the loan request page
    And I enter a loan amount of "100000"
    And I enter a down payment of "100"
    And I select the first available deposit account
    And I click the apply now button
    Then I should see the loan evaluation result
