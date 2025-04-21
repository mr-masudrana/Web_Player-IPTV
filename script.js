let channels = [];

const channelList = document.getElementById("channelList");
const searchInput = document.getElementById("searchInput");
const player = document.getElementById("tvPlayer");
const categoryFilter = document.getElementById("categoryFilter");

let currentHls;

function loadChannel(channel) {
  if (currentHls) {
    currentHls.destroy();
  }

  if (Hls.isSupported()) {
    currentHls = new Hls();
    currentHls.loadSource(channel.url);
    currentHls.attachMedia(player);
  } else if (player.canPlayType("application/vnd.apple.mpegurl")) {
    player.src = channel.url;
  }
}

function renderChannels(filter = "") {
  const selectedCategory = categoryFilter.value;
  channelList.innerHTML = "";

  const grouped = {};

  channels.forEach(channel => {
    const matchName = channel.name.toLowerCase().includes(filter.toLowerCase());
    const matchCategory = !selectedCategory || channel.category === selectedCategory;

    if (matchName && matchCategory) {
      if (!grouped[channel.category]) {
        grouped[channel.category] = [];
      }
      grouped[channel.category].push(channel);
    }
  });

  for (const category in grouped) {
    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = category;
    channelList.appendChild(header);

    grouped[category].forEach(channel => {
      const div = document.createElement("div");
      div.className = "channel-item";
      div.innerHTML = `
        <img src="${channel.logo}" class="channel-logo" />
        <span>${channel.name}</span>
      `;
      div.onclick = () => loadChannel(channel);
      channelList.appendChild(div);
    });
  }
}

function populateCategoryFilter() {
  const categories = [...new Set(channels.map(c => c.category))];
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

searchInput.addEventListener("input", () => {
  renderChannels(searchInput.value);
});

categoryFilter.addEventListener("change", () => {
  renderChannels(searchInput.value);
});

fetch("channels.json")
  .then(response => response.json())
  .then(data => {
    channels = data;
    populateCategoryFilter();
    renderChannels();
    loadChannel(channels[0]);
  });