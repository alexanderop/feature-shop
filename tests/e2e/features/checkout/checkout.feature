@checkout
Feature: Simulated checkout
  @id:checkout-validation
  Scenario: Missing customer details explain how to continue
    Given my cart contains 1 backpacks
    When I open checkout
    And I place my order
    Then I see required customer field errors

  @id:checkout-decline-retry
  Scenario: A declined payment can be retried
    Given my cart contains 1 backpacks
    When I open checkout
    And I enter valid customer details
    And I choose a declined payment
    And I place my order
    Then my payment is declined without losing my cart
    When I choose an approved payment
    And I place my order
    Then my order is confirmed
    And my receipt total is "40.00"

  @id:checkout-success
  Scenario: Successful checkout clears the cart
    Given my cart contains 1 backpacks
    When I open checkout
    And I enter valid customer details
    And I choose an approved payment
    And I place my order
    Then my order is confirmed
    And my receipt total is "40.00"
    When I open my cart
    Then my cart is empty
