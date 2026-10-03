@cart
Feature: Three backpack quantity
  @id:agent-three-backpacks
  Scenario: Three backpacks cost 120.00
    Given my cart contains 1 backpacks
    When I open my cart
    And I set my backpack quantity to 3
    Then my backpack quantity is 3
    And my cart subtotal is "120.00"
