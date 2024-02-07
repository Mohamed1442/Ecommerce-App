const deleteProduct = function (btn) {
  const productId = btn.parentNode.querySelector("[name=productId]").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
  const articleEl = btn.closest("article");

  fetch("/admin/products/" + productId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((result) => {
      console.log(result);
      articleEl.remove();
    })
    .catch((err) => {
      console.log(err);
    });
};
