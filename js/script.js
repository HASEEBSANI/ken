async function loadSidebar() {

  const response = await fetch('components/sidebar.html');

  const data = await response.text();

  document.getElementById('sidebar-container').innerHTML = data;
}

loadSidebar();



function toggleSidebar() {

  const sidebar = document.getElementById('sidebar');

  const overlay = document.getElementById('sidebarOverlay');

  const isOpen = sidebar.classList.contains('show');

  if (!isOpen) {

    sidebar.classList.add('show');

    overlay.classList.add('show');

    document.body.classList.add('menu-open');

    history.pushState({ drawer: 'open' }, '');

  } else {

    closeSidebar();

  }
}



function closeSidebar() {

  const sidebar = document.getElementById('sidebar');

  const overlay = document.getElementById('sidebarOverlay');

  sidebar.classList.remove('show');

  overlay.classList.remove('show');

  document.body.classList.remove('menu-open');

  if (history.state && history.state.drawer === 'open') {

    history.back();

  }
}



window.addEventListener('popstate', () => {

  const sidebar = document.getElementById('sidebar');

  if (sidebar && sidebar.classList.contains('show')) {

    sidebar.classList.remove('show');

    document.getElementById('sidebarOverlay')
      .classList.remove('show');

    document.body.classList.remove('menu-open');

  }

});



function toggleAccordion(id) {

  const targetMenu = document.getElementById(id);

  const targetContent =
    targetMenu.querySelector('.menu-content');

  const targetIcon =
    targetMenu.querySelector('.rotate-icon');

  const isAlreadyOpen =
    !targetContent.classList.contains('hidden');

  document.querySelectorAll('.menu-item')
    .forEach(item => {

      const content =
        item.querySelector('.menu-content');

      const icon =
        item.querySelector('.rotate-icon');

      if (content) {
        content.classList.add('hidden');
      }

      if (icon) {
        icon.classList.remove('rotate-180');
      }

    });

  if (!isAlreadyOpen) {

    targetContent.classList.remove('hidden');

    targetIcon.classList.add('rotate-180');

  }

}



document.addEventListener('DOMContentLoaded', () => {

  const now = new Date();

  const dateDisplay =
    document.getElementById('dateDisplay');

  if (dateDisplay) {

    dateDisplay.innerText =
      now.toLocaleDateString('en-GB', {

        day: 'numeric',
        month: 'long',
        year: 'numeric'

      });

  }

});
