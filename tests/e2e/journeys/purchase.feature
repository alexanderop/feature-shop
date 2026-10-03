@search @product-detail @cart @checkout
Feature: Complete a purchase
  @id:purchase-journey
  Scenario: Find a product and buy two
    Given I browse the catalog
    When I search for "Canvas Backpack"
    And I open product "Canvas Backpack"
    Then I see the Canvas Backpack details
    When I add the product to my cart
    And I open my cart
    And I set my backpack quantity to 2
    Then my cart subtotal is "80.00"
    When I open checkout
    And I enter valid customer details
    And I choose an approved payment
    And I place my order
    Then my order is confirmed
    And my receipt total is "80.00"
    When I open my cart
    Then my cart is empty
