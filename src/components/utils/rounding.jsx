
/**
 * Smart rounding rules for ingredient scaling
 * Makes measurements practical for real-world cooking
 *
 * TODO: Add imperial unit support for US users:
 * - Convert ml to fl oz, cups, pints
 * - Convert g/kg to oz, lbs
 * - Add smart rounding for imperial measurements
 */

export function smartRoundIngredientAmount(amount, unit, measurementSystem = 'metric') {
    // TODO: When measurementSystem === 'imperial', convert and round appropriately
    // For now, handle metric units with smart rounding

    // Handle different units with appropriate rounding
    switch (unit) {
        case 'ml':
            return smartRoundMilliliters(amount);
        case 'g':
            return smartRoundGrams(amount);
        case 'pieces':
        case 'whole':
        case 'slices':
            return smartRoundCountable(amount);
        case 'cups':
            return smartRoundCups(amount);
        case 'tsp':
        case 'tbsp':
            return smartRoundSpoons(amount);
        case 'kg':
            return smartRoundKilograms(amount);
        // TODO: Add imperial units like 'fl oz', 'oz', 'lbs', 'pints'
        default:
            return Math.round(amount * 10) / 10; // Default to 1 decimal place
    }
}

function smartRoundMilliliters(ml) {
    if (ml <= 50) {
        // Round to nearest 5ml for small amounts
        return Math.round(ml / 5) * 5;
    } else if (ml <= 100) {
        // Round to nearest 10ml for medium amounts
        return Math.round(ml / 10) * 10;
    } else if (ml <= 500) {
        // Round to nearest 25ml for larger amounts
        return Math.round(ml / 25) * 25;
    } else {
        // Round to nearest 50ml for very large amounts
        return Math.round(ml / 50) * 50;
    }
}

function smartRoundGrams(g) {
    if (g <= 50) {
        // Round to nearest 5g for small amounts
        return Math.round(g / 5) * 5;
    } else if (g <= 100) {
        // Round to nearest 10g for medium amounts
        return Math.round(g / 10) * 10;
    } else if (g <= 500) {
        // Round to nearest 25g for larger amounts
        return Math.round(g / 25) * 25;
    } else {
        // Round to nearest 50g for very large amounts
        return Math.round(g / 50) * 50;
    }
}

function smartRoundCountable(count) {
    if (count <= 1) {
        // Keep precision for small amounts (0.5 pieces, etc.)
        return Math.round(count * 4) / 4; // Round to nearest 0.25
    } else if (count <= 5) {
        // Round to nearest 0.5 for small counts
        return Math.round(count * 2) / 2;
    } else {
        // Round to whole numbers for larger counts
        return Math.round(count);
    }
}

function smartRoundCups(cups) {
    if (cups <= 0.25) {
        // Very precise for small amounts (1/8, 1/4 cup)
        return Math.round(cups * 8) / 8;
    } else if (cups <= 1) {
        // Quarter cup precision for medium amounts
        return Math.round(cups * 4) / 4;
    } else {
        // Half cup precision for larger amounts
        return Math.round(cups * 2) / 2;
    }
}

function smartRoundSpoons(spoons) {
    if (spoons <= 1) {
        // Quarter spoon precision for small amounts
        return Math.round(spoons * 4) / 4;
    } else if (spoons <= 5) {
        // Half spoon precision for medium amounts
        return Math.round(spoons * 2) / 2;
    } else {
        // Whole spoon for larger amounts
        return Math.round(spoons);
    }
}

function smartRoundKilograms(kg) {
    if (kg <= 0.5) {
        // Round to nearest 50g (0.05kg) for small amounts
        return Math.round(kg * 20) / 20;
    } else if (kg <= 2) {
        // Round to nearest 100g (0.1kg) for medium amounts
        return Math.round(kg * 10) / 10;
    } else {
        // Round to nearest 250g (0.25kg) for larger amounts
        return Math.round(kg * 4) / 4;
    }
}

/**
 * Format the rounded amount with appropriate display text
 */
export function formatIngredientAmount(amount, unit, measurementSystem = 'metric') {
    // TODO: When measurementSystem === 'imperial', show imperial units
    const rounded = smartRoundIngredientAmount(amount, unit, measurementSystem);

    // Handle special cases for display
    if (unit === 'pieces' && rounded === 1) {
        return `${rounded} piece`;
    } else if (unit === 'whole' && rounded === 1) {
        return `${rounded} whole`;
    } else {
        return `${rounded} ${unit}`;
    }
}


/**
 * Scale an entire recipe's ingredients with smart rounding
 */
export function scaleRecipeIngredients(ingredients, scalingFactor, measurementSystem = 'metric') {
    return ingredients.map(ingredient => {
        const scaledAmount = ingredient.amount * scalingFactor;
        const roundedAmount = smartRoundIngredientAmount(scaledAmount, ingredient.unit, measurementSystem);
        const displayAmount = formatIngredientAmount(roundedAmount, ingredient.unit, measurementSystem);

        return {
            ...ingredient,
            scaled_amount: roundedAmount,
            scaled_display_amount: displayAmount
        };
    });
}
