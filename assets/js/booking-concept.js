/* Concept booking flow.
   Entirely local: no network request, no storage, no cookies, no email.
   It exists so the shape of the experience can be felt, not so calls can be booked. */
(function () {
  'use strict';

  var root = document.querySelector('[data-booking-concept]');
  if (!root) return;

  var slots = ['8:00am', '9:30am', '11:00am', '1:30pm', '3:00pm'];
  var taken = { 1: 1, 2: 4, 4: 2 }; // index of a day -> index of a slot already gone

  var dayStrip = root.querySelector('[data-days]');
  var slotPanel = root.querySelector('[data-slots]');
  var slotTitle = root.querySelector('[data-slot-title]');
  var stepOne = root.querySelector('[data-step="1"]');
  var stepTwo = root.querySelector('[data-step="2"]');
  var stepThree = root.querySelector('[data-step="3"]');
  var chosen = { day: null, time: null };

  function nextDays(count) {
    var out = [];
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    while (out.length < count) {
      var day = d.getDay();
      if (day !== 0 && day !== 6) out.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  var days = nextDays(10);

  function fmtDay(date) {
    return date.toLocaleDateString('en-AU', { weekday: 'short' });
  }
  function fmtDate(date) {
    return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  }

  days.forEach(function (date, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'day';
    b.setAttribute('aria-pressed', 'false');
    b.innerHTML =
      '<span class="day__dow">' + fmtDay(date) + '</span>' +
      '<span class="day__num">' + date.getDate() + '</span>' +
      '<span class="day__mon">' + date.toLocaleDateString('en-AU', { month: 'short' }) + '</span>';
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(dayStrip.children, function (el) {
        el.setAttribute('aria-pressed', 'false');
        el.classList.remove('is-active');
      });
      b.setAttribute('aria-pressed', 'true');
      b.classList.add('is-active');
      chosen.day = { date: date, index: i };
      renderSlots();
    });
    dayStrip.appendChild(b);
  });

  function renderSlots() {
    if (!chosen.day) return;
    slotTitle.textContent = chosen.day.date.toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    slotPanel.innerHTML = '';
    slots.forEach(function (time, i) {
      var gone = taken[chosen.day.index] === i;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'slot' + (gone ? ' is-gone' : '');
      b.disabled = gone;
      b.textContent = gone ? time + ' — taken' : time;
      if (!gone) {
        b.addEventListener('click', function () {
          chosen.time = time;
          goToTwo();
        });
      }
      slotPanel.appendChild(b);
    });
  }

  function goTo(step) {
    [stepOne, stepTwo, stepThree].forEach(function (el) {
      el.hidden = el.getAttribute('data-step') !== String(step);
    });
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var box = root.getBoundingClientRect();
    if (box.top < 0 || box.top > window.innerHeight * 0.4) {
      root.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function goToTwo() {
    root.querySelector('[data-summary]').textContent =
      chosen.day.date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }) +
      ' at ' + chosen.time;
    goTo(2);
    var first = stepTwo.querySelector('input');
    if (first) first.focus();
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('[data-back]');
    if (t) {
      goTo(1);
      return;
    }
    var confirm = e.target.closest('[data-confirm]');
    if (confirm) {
      e.preventDefault();
      var name = stepTwo.querySelector('#bc-name');
      var email = stepTwo.querySelector('#bc-email');
      var job = stepTwo.querySelector('#bc-job');
      if (!name.value.trim() || !email.value.trim()) {
        (name.value.trim() ? email : name).focus();
        root.querySelector('[data-warn]').hidden = false;
        return;
      }
      root.querySelector('[data-warn]').hidden = true;
      root.querySelector('[data-done-name]').textContent = name.value.trim().split(' ')[0];
      root.querySelector('[data-done-when]').textContent =
        chosen.day.date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }) +
        ' at ' + chosen.time;
      root.querySelector('[data-done-job]').textContent =
        job.value.trim() || 'the job you described on the call';
      goTo(3);
      return;
    }
    var reset = e.target.closest('[data-reset]');
    if (reset) {
      chosen = { day: null, time: null };
      Array.prototype.forEach.call(dayStrip.children, function (el) {
        el.setAttribute('aria-pressed', 'false');
        el.classList.remove('is-active');
      });
      slotPanel.innerHTML = '';
      slotTitle.textContent = 'Pick a day';
      stepTwo.querySelectorAll('input, textarea').forEach(function (f) {
        f.value = '';
      });
      goTo(1);
    }
  });

  slotTitle.textContent = 'Pick a day';
  goTo(1);
})();
