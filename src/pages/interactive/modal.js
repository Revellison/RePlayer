
if (typeof openModalBtns === 'undefined') {
    const openModalBtns = document.querySelectorAll(".playlist-card");
    const modal = document.querySelector(".modal");
    const closeBtn = document.querySelector(".close");

    function openModal() {
        modal.style.display = "block";
        setTimeout(() => {
            modal.classList.add("show");
        }, 10);
    }

    function closeModal() {
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
        }, 300);
    }

    openModalBtns.forEach(button => {
        button.addEventListener("click", openModal);
    });

    closeBtn.addEventListener("click", closeModal);

    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            closeModal();
        }
    });
}
