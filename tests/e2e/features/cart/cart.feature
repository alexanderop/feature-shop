@cart
Feature: Cart management
  @id:cart-quantity
  Scenario: Quantity changes update the total
    Given my cart contains 1 backpacks
    When I open my cart
    And I set my backpack quantity to 2
    Then my cart subtotal is "80.00"
    And my backpack quantity is 2

  @id:cart-reload
  Scenario: Cart survives a page reload
    Given my cart contains 2 backpacks
    When I open my cart
    And I reload the page
    Then my backpack quantity is 2
    And my cart subtotal is "80.00"

  @id:cart-remove
  Scenario: Remove the last product
    Given my cart contains 1 backpacks
    When I open my cart
    And I remove the backpack
    Then my cart is empty

  @id:cart-context-isolation
  Scenario: Each shopper has an independent cart
    Given my cart contains 1 backpacks
    When I open my cart
    Then a separate shopper has an empty cart
    And my backpack quantity is 1
