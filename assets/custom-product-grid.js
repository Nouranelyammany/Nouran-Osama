/* *Initialize DOM elements and variables
* keep track of the selected product, variants, and cart payload */
document.addEventListener('DOMContentLoaded', () =>{
    const modal = document.querySelector('[data-product-modal]');
    if (!modal) return;
    const triggers = document.querySelectorAll('[data-product-trigger]');
    const closeButtons = modal.querySelectorAll('[data-modal-close]');
    const modalImage = modal.querySelector('[data-modal-image]');
    const modalTitle = modal.querySelector('[data-modal-title]');
    const modalPrice = modal.querySelector('[data-modal-price]');
    const modalDescription = modal.querySelector('[data-modal-description]');
    const modalOptions = modal.querySelector('[data-modal-options]');
    const addToCartButton = modal.querySelector('[data-add-to-cart]');
    const cartMessage = modal.querySelector('[data-cart-message]');
    let currentProduct = null;
    let selectedVariantId = null;
    let selectedVariantObject = null;
    
/* Bind click handlers to product cards to extract JSON data and open the pop up */
triggers.forEach((trigger) => {
    trigger.addEventListener('click', () =>{
        const card = trigger.closest('.product-card');
        const productDataElement = card.querySelector('.product-data');
       try {
                currentProduct = JSON.parse(productDataElement.textContent);
                openModal(currentProduct);
            } catch (err) {
                console.error("Failed to parse product JSON:", err);
            }
    });
});
function openModal(product){
    modalImage.src = product.featured_image || product.featured_media?.src || '';
    modalImage.alt = product.title;
    modalTitle.textContent = product.title;
    modalPrice.textContent =typeof product.price === 'number'
    ? `$${(product.price / 100).toFixed(2)}` 
            : product.price;
    modalDescription.textContent =product.description || '';
    cartMessage.textContent ='';
    selectedVariantId= null;
    selectedVariantObject= null;
    renderVariants(product);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}
function closeModal(){
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow= '';
}
closeButtons.forEach((button)=>{
    button.addEventListener('click', closeModal);
});

 /* *Dynamic option button
 * variant options for color and size */
function renderVariants(product) {
    modalOptions.innerHTML = '';
/* If the product has only one default variant*/
    if (
        product.variants.length === 1 &&
        product.variants[0].title.includes('Default')
    ) {
        selectedVariantId = product.variants[0].id;
        selectedVariantObject = product.variants[0];
        return;
    }
    const optionNames = getOptionNames(product);
    optionNames.forEach((optionName, optionIndex) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('modal-option-row');
        const label = document.createElement('p');
        label.classList.add('modal-option-label');
        label.textContent = optionName;
        wrapper.appendChild(label);
        const values = getUniqueOptionValues(
            product.variants,
            optionIndex
        );

        /* SIZE → SELECT DROPDOWN*/
        if (optionName.toLowerCase() === 'size') {
            const select = document.createElement('select');
            select.classList.add('modal-option-select');
            select.dataset.optionIndex = optionIndex;
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Choose your size';
            placeholder.disabled = true;
            placeholder.selected = true;
            select.appendChild(placeholder);

            /* Add size options*/
            values.forEach((value) => {

                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);

            });

            // When user selects a size
            select.addEventListener('change', () => {

                selectOption(
                    optionIndex,
                    select.value,
                    product
                );

            });
            wrapper.appendChild(select);

        }

        // COLOR → BUTTONS
        else {

            values.forEach((value) => {

                const button = document.createElement('button');
                button.type = 'button';
                button.classList.add('modal-option-button');
                button.textContent = value;
                button.dataset.optionIndex = optionIndex;
                button.dataset.optionValue = value;
                button.addEventListener('click', () => {
                    selectOption(
                        optionIndex,
                        value,
                        product
                    );

                });

                wrapper.appendChild(button);

            });

        }
        modalOptions.appendChild(wrapper);

    });
}
function getOptionNames(product){
    if (product.options && Array.isArray(product.options) && typeof product.options[0] === 'string'){
        return product.options; 
    }
    
    const firstVariant = product.variants ? product.variants[0] : null;
    if (!firstVariant) return [];
    return firstVariant.options.map((_, index) => {
        if (index === 0) return 'color';
        if (index === 1) return 'size';
        return `Option ${index + 1}`;
    });
}
function getUniqueOptionValues(variants, optionIndex) {
    const values = variants.map((variant) => variant.options[optionIndex]);
    return [...new Set(values)];

}
/* *Handle active states
* evaluate currently selected options against the product variants  array to
*identify active variants Id */
function selectOption(optionIndex, value, product) {
    const buttons = modalOptions.querySelectorAll(`[data-option-index="${optionIndex}"]`);
    buttons.forEach((button) => button.classList.remove('is-selected'));
    const selectedButton = modalOptions.querySelector(
        `[data-option-index="${optionIndex}"][data-option-value="${value}"]`
    );
    if (selectedButton) {
        selectedButton.classList.add('is-selected');
    
    }
    findMatchingVariant(product);

}
function findMatchingVariant(product) {
    const selectedOptions = [];
    const selectedButtons = modalOptions.querySelectorAll('.is-selected');
    selectedButtons.forEach((button) => {
        selectedOptions.push(button.dataset.optionValue);
    });
    const matchingVariant = product.variants.find((variant) => {
        return variant.options.every((option, index) => option === selectedOptions[index]);
    });
    if (matchingVariant) {
        selectedVariantId = Number(matchingVariant.id);
        selectedVariantObject = matchingVariant;
        cartMessage.textContent = '';
    } else {
        selectedVariantId = null;
        selectedVariantObject = null;
    }
}
addToCartButton.addEventListener('click', async () => {
    if (!selectedVariantId) {
        cartMessage.textContent = 'Please select all options.';
        return;
    }
    addToCartButton.disabled = true;
    cartMessage.textContent = 'Adding to cart...';
    await addProductToCart(selectedVariantObject);
    addToCartButton.disabled = false;
});
async function addProductToCart(variantObject) {
    try {
        let itemsToCart = [
            {
                id: Number(variantObject.id),
                quantity: 1
            }
        ];
            const optionValuesLower = variantObject.options.map((opt) => String(opt).toLowerCase());
            const hasBlack = optionValuesLower.includes('black');
            const hasMedium = optionValuesLower.includes('medium') || optionValuesLower.includes('m');
            const isBlackAndMedium = hasBlack && hasMedium;
        if (isBlackAndMedium) {
            try {
                const jacketResponse = await fetch(
                    `${window.Shopify.routes.root}products/dark-winter-jacket.js`
                );
                if (jacketResponse.ok) {
                    const jacketData = await jacketResponse.json();
                    if (jacketData.variants && jacketData.variants.length > 0) {
                        itemsToCart.push({
                           id: Number(jacketData.variants[0].id),
                                quantity: 1
                        });
                    } 
                }
                    
        } 
        catch (jacketError) {
            console.warn('Could not auto-fetch Soft Winter Jacket bundle:', jacketError);
        }
    }
    const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: itemsToCart })
    });
    if (!response.ok) {
        throw new Error('Unable to add product to cart.');

    }
    cartMessage.textContent = isBlackAndMedium
    ? 'Added product + Soft Winter Jacket to cart!'
    : 'Added to cart successfully.';
    setTimeout(() => {
        window.location.href = '/cart';
    }, 800);
} catch (error) {
    cartMessage.textContent = error.message;
  }
}
}); 
