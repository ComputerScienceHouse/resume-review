const replyBtns = document.getElementsByClassName('reply');

const reply = event => {
  event.preventDefault();
  let button = event.target;
  if (button.classList.contains('fas')) {
    button = button.parentElement; // click event targetted icon
  }
  const formHTML = `
    <form class="response">
      <input name="parent_id" type="text" value="${button.dataset.parent}" readonly hidden>
      <div class="form-row">
        <div class="col-9 col-md-10">
          <input class="comment-input" name="body" type="text" placeholder="New reply">
        </div>
        <div class="col-3 col-md-2">
          <input type="button" value="Post" onclick="sendComment(event)" class="btn btn-primary">
        </div>
      </div>
    </form>`;
  button
    .parentElement // get <div> surrounding link
    .parentElement // get <li> surrounding comment
    .parentElement // get <ul> surrounding thread
    .insertAdjacentHTML('beforeEnd', formHTML);
 button.style.display = 'none'; // hide link once form is visible
};

const sendComment = event => {
  const form = event.target.form;
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
  let button = event.target;
  if (button.tagName.toLowerCase() === 'i') {
    button = event.target.parentElement;
  }
  const id = button.dataset.parent;
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

const previewResume = event => {
  event.preventDefault();
  const id = event.target.dataset.id;
  document.getElementById(id).classList.toggle('collapsed');
};