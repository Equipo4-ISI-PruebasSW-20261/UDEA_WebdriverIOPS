Feature: Login - Inicio de sesión en Parabank
  Como usuario registrado
  Quiero poder iniciar sesión con mis credenciales
  Para acceder a mi cuenta bancaria

  Background:
    Given I am on the login page

  @login
  Scenario: Login exitoso con credenciales válidas redirige al dashboard
    When I login with username "john" and password "demo"
    Then I should see the page title "Accounts Overview"

  @login
  Scenario: Login fallido con credenciales inválidas muestra mensaje de error
    When I login with username "usuarioInvalido" and password "claveInvalida"
    Then I should see an error message containing "Error!"

  @login
  Scenario: Login con contraseña incorrecta muestra mensaje de error
    When I login with username "john" and password "wrongpassword"
    Then I should see an error message containing "Error!"

  @login
  Scenario: Login con campos vacíos muestra mensaje de error
    When I login with username "" and password ""
    Then I should see an error message containing "Error!"

  @login
  Scenario Outline: Login con múltiples combinaciones de credenciales
    When I login with username "<username>" and password "<password>"
    Then I should see the result message "<message>"

    Examples:
      | username        | password | message           |
      | john            | demo     | Accounts Overview |
      | invalidUser     | badPass  | Error!            |
