@search
Feature: Search the catalog
  @id:search-results
  Scenario: Search finds the matching product
    Given I browse the catalog
    When I search for "Canvas Backpack"
    Then I see product "Canvas Backpack"
    And I do not see product "Everyday Bottle"

  @id:search-empty
  Scenario: Search explains an empty result
    Given I browse the catalog
    When I search for "nonexistent-zebra-product"
    Then I see no matching products

  @id:search-category
  Scenario: Category filters the catalog
    Given I browse the catalog
    When I select category "Drinkware"
    Then I see product "Everyday Bottle"
    And I do not see product "Canvas Backpack"

  @id:search-keyboard
  Scenario: Submit a search from the keyboard
    Given I browse the catalog
    When I search using the keyboard for "Everyday Bottle"
    Then I see product "Everyday Bottle"
    And I do not see product "Canvas Backpack"
