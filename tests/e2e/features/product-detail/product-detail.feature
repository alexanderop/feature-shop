@product-detail
Feature: Product details
  @id:detail-add @cart
  Scenario: Add a product from its detail page
    Given I view the Canvas Backpack
    Then I see the Canvas Backpack details
    When I add the product to my cart
    And I open my cart
    Then my backpack quantity is 1
    And my cart subtotal is "40.00"
