const replyBtns = document.getElementsByClassName('reply');

const reply = event => {
  event.preventDefault();
  const formHTML = `
    <form class="response">
      <input name="parent_id" type="text" value="${event.target.dataset.parent}" readonly hidden>
      <input id="comment-input" name="body" type="text" placeholder="New reply">
      <input type="button" value="Post" onclick="sendComment(event)" class="btn btn-primary">
    </form>`;
  event.target
    .parentElement // get <p> surrounding link clicked
    .parentElement // get <div> surrounding thread
    .insertAdjacentHTML('beforeEnd', formHTML);
  event.target.style.display = 'none'; // hide link once form is visible
};

const sendComment = event => {
  const form = event.target.parentElement;
  const parent_id = form.querySelector('[name=parent_id]').value;
  const body = form.querySelector('[name=body]').value;
  if (!parent_id || !body) {
    alert('Enter a comment body');
    return;
  }
  const request = new Request('/comment/');
  const options = {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent_id,
      body,
    }),
  };
  fetch(request, options)
    .then(response => {
      if (response.code > 399) {
        alert('Could not post comment.');
      } else {
        window.location.reload();
      }
    })
    .catch(error => {
      console.log(error);
    }
  );
};

const deleteComment = event => {
  event.preventDefault();
  const id = event.target.dataset.parent;
  const request = new Request('/comment/');
  const options = {
    method: 'DELETE',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
    }),
  };
  fetch(request, options)
    .then(response => {
      if (response.code > 399) {
        alert('Could not delete comment.');
      } else {
        window.location.reload();
      }
    })
    .catch(error => {
      console.log(error);
    }
  );
};