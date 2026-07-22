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
        currentProduct= JSON.parse(productDataElement.textContent);
        openModal(currentProduct);
    });
});
function openModal(product){
    modalImage.src = product.featured_image;
    modalImage.alt = product.title;
    modalTitle.textContent = product.title;
    modalPrice.textContent = product.price;
    modalDescription.textContent =product.description;
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
    document.body,style.overflow= '';
}
closeButtons.forEach((button)=>{
    button.addEventListener('click', closeModal);
});










}