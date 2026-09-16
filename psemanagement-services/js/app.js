
(function(D) {
    const app = document.getElementById('app');
    const navigate = (path) => {
        history.pushState(null, null, path);
        render();
    };

    D.path = () => location.pathname;

    document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target && target.host === location.host && !target.hasAttribute('data-external')) {
            e.preventDefault();
            navigate(target.pathname);
        }
    });

    window.addEventListener('popstate', render);

    // Helpers
    D.pageHero = (img, title, subtitle = '') => `
        <div class="relative w-full h-96 bg-cover bg-center" style="background-image: url('${img}');">
            <div class="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white p-4">
                <h1 class="text-5xl font-bold text-center">${title}</h1>
                ${subtitle ? `<p class="text-xl mt-2 text-center">${subtitle}</p>` : ''}
            </div>
        </div>
    `;

    D.formBox = (action, method, fields, submitText = 'Submit', id = '') => `
        <form ${id ? `id="${id}"` : ''} class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto my-8" action="${action}" method="${method}">
            ${fields.map(field => `
                <div class="mb-4">
                    <label for="${field.id}" class="block text-gray-700 text-sm font-bold mb-2">${field.label}:</label>
                    <${field.type === 'textarea' ? 'textarea' : 'input'}
                        class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="${field.id}"
                        name="${field.name || field.id}"
                        type="${field.type === 'textarea' ? '' : field.type}"
                        placeholder="${field.placeholder || ''}"
                        ${field.required ? 'required' : ''}
                    >${field.type === 'textarea' ? '</textarea>' : ''}
                </div>
            `).join('')}
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                ${submitText}
            </button>
        </form>
    `;

    D.newsCard = (news) => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img src="${news.image}" alt="${news.title}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-xl font-semibold mb-2">${news.title}</h3>
                <p class="text-gray-600 text-sm">${news.date}</p>
                <a href="/news/${news.slug}" class="text-blue-600 hover:underline mt-2 inline-block">Read More</a>
            </div>
        </div>
    `;

    D.playerCard = (player) => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden text-center hover:shadow-lg transition-shadow duration-300">
            <img src="${player.image}" alt="${player.name}" class="w-full h-64 object-cover">
            <div class="p-4">
                <h3 class="text-xl font-semibold">${player.name}</h3>
                <p class="text-gray-600">${player.position} | #${player.number}</p>
                <a href="/players/${player.slug}" class="text-blue-600 hover:underline mt-2 inline-block">View Profile</a>
            </div>
        </div>
    `;

    D.videoCard = (video) => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img src="https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg" alt="${video.title}" class="w-full h-48 object-cover cursor-pointer" onclick="navigate('/videos/${video.id}')">
            <div class="p-4">
                <h3 class="text-lg font-semibold">${video.title}</h3>
                <p class="text-gray-600 text-sm">${video.date}</p>
            </div>
        </div>
    `;

    // Riley Form handlers
    const rileyFormHandler = async (e) => {
        e.preventDefault();
        const form = e.target;
        const inquiry = {
            query: form.query.value,
            topic: form.topic.value,
            timestamp: new Date().toISOString()
        };
        console.log('Riley Inquiry:', inquiry);
        let inquiries = JSON.parse(localStorage.getItem('ifms_inquiries') || '[]');
        inquiries.push(inquiry);
        localStorage.setItem('ifms_inquiries', JSON.stringify(inquiries));
        alert('Thank you for your inquiry!');
        form.reset();
    };

    // Home Page
    D.home = async () => {
        let livebarContent = '<div class="bg-gray-800 text-white p-2 text-center">Loading live updates...</div>';
        try {
            const response = await fetch('/api/health');
            const data = await response.json();
            livebarContent = `<div class="bg-gray-800 text-white p-2 text-center">Status: ${data.status} | Uptime: ${data.uptime}s</div>`;
        } catch (error) {
            console.error('Failed to fetch livebar data:', error);
            livebarContent = '<div class="bg-red-800 text-white p-2 text-center">Live updates unavailable.</div>';
        }

        const nextGameTime = new Date('2026-09-18T19:30:00-04:00').getTime();
        let countdownHtml = '';
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = nextGameTime - now;
            if (distance < 0) {
                countdownHtml = 'Next game is live or has passed!';
                return;
            }
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            countdownHtml = `Next Game: ${days}d ${hours}h ${minutes}m ${seconds}s`;
            if (app.querySelector('#next-game-countdown')) {
                 app.querySelector('#next-game-countdown').innerHTML = countdownHtml;
            }
        };
        setInterval(updateCountdown, 1000);
        updateCountdown(); // Initial call

        return `
            ${livebarContent}
            ${D.pageHero('/media/hero-arena.jpg', 'Point Goddess Basketball', 'Igniting the Court')}

            <div class="container mx-auto p-4">
                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Team Statistics</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="bg-blue-100 p-6 rounded-lg shadow-md text-center">
                            <h3 class="text-2xl font-semibold">Wins</h3>
                            <p class="text-4xl text-blue-800">${D.meta?.wins || 'N/A'}</p>
                        </div>
                        <div class="bg-red-100 p-6 rounded-lg shadow-md text-center">
                            <h3 class="text-2xl font-semibold">Losses</h3>
                            <p class="text-4xl text-red-800">${D.meta?.losses || 'N/A'}</p>
                        </div>
                        <div class="bg-green-100 p-6 rounded-lg shadow-md text-center">
                            <h3 class="text-2xl font-semibold">PPG</h3>
                            <p class="text-4xl text-green-800">${D.meta?.ppg || 'N/A'}</p>
                        </div>
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Featured News</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${[
                            {image: 'https://via.placeholder.com/400x250', title: 'Featured Article One', date: 'Oct 26, 2023', slug: 'featured-article-one'},
                            {image: 'https://via.placeholder.com/400x250', title: 'Featured Article Two', date: 'Oct 25, 2023', slug: 'featured-article-two'},
                            {image: 'https://via.placeholder.com/400x250', title: 'Featured Article Three', date: 'Oct 24, 2023', slug: 'featured-article-three'},
                        ].map(D.newsCard).join('')}
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Latest News</h2>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        ${[
                            {image: 'https://via.placeholder.com/300x200', title: 'Latest News Item 1', date: 'Oct 23, 2023', slug: 'latest-news-1'},
                            {image: 'https://via.placeholder.com/300x200', title: 'Latest News Item 2', date: 'Oct 22, 2023', slug: 'latest-news-2'},
                            {image: 'https://via.placeholder.com/300x200', title: 'Latest News Item 3', date: 'Oct 21, 2023', slug: 'latest-news-3'},
                            {image: 'https://via.placeholder.com/300x200', title: 'Latest News Item 4', date: 'Oct 20, 2023', slug: 'latest-news-4'},
                            {image: 'https://via.placeholder.com/300x200', title: 'Latest News Item 5', date: 'Oct 19, 2023', slug: 'latest-news-5'},
                            {image: 'https://via.placeholder.com/300x200', title: 'Latest News Item 6', date: 'Oct 18, 2023', slug: 'latest-news-6'},
                        ].map(D.newsCard).join('')}
                    </div>
                </section>

                <section class="my-8 bg-purple-700 text-white p-8 rounded-lg shadow-xl text-center">
                    <h2 class="text-4xl font-bold mb-4">Next Game!</h2>
                    <p id="next-game-countdown" class="text-3xl font-mono mb-4">${countdownHtml}</p>
                    <p class="text-xl">Against Team X at Arena Y</p>
                    <a href="/games/next" class="mt-6 inline-block bg-white text-purple-700 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300">Get Tickets</a>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Upcoming Schedule</h2>
                    <div class="overflow-x-auto">
                        <div class="flex space-x-4 p-2 bg-gray-100 rounded-lg">
                            <div class="flex-none w-64 p-4 bg-white rounded-lg shadow-md">
                                <p class="font-semibold">Nov 5</p>
                                <p>vs Team A</p>
                                <p class="text-sm text-gray-600">7:00 PM EST</p>
                            </div>
                            <div class="flex-none w-64 p-4 bg-white rounded-lg shadow-md">
                                <p class="font-semibold">Nov 8</p>
                                <p>@ Team B</p>
                                <p class="text-sm text-gray-600">8:00 PM EST</p>
                            </div>
                            <div class="flex-none w-64 p-4 bg-white rounded-lg shadow-md">
                                <p class="font-semibold">Nov 12</p>
                                <p>vs Team C</p>
                                <p class="text-sm text-gray-600">7:30 PM EST</p>
                            </div>
                             <div class="flex-none w-64 p-4 bg-white rounded-lg shadow-md">
                                <p class="font-semibold">Nov 15</p>
                                <p>@ Team D</p>
                                <p class="text-sm text-gray-600">9:00 PM EST</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-center mt-6">
                        <a href="/schedule" class="text-blue-600 hover:underline">View Full Schedule</a>
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Our Roster</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        ${[
                            {image: 'https://via.placeholder.com/300x400', name: 'Player One', position: 'Guard', number: 1, slug: 'player-one'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Player Two', position: 'Forward', number: 2, slug: 'player-two'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Player Three', position: 'Center', number: 3, slug: 'player-three'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Player Four', position: 'Guard', number: 4, slug: 'player-four'},
                        ].map(D.playerCard).join('')}
                    </div>
                    <div class="text-center mt-6">
                        <a href="/roster" class="text-blue-600 hover:underline">View Full Roster</a>
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Featured Players</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${[
                            {image: 'https://via.placeholder.com/500x350', name: 'Star Player A', position: 'Guard', number: 10, slug: 'star-player-a'},
                            {image: 'https://via.placeholder.com/500x350', name: 'Star Player B', position: 'Forward', number: 23, slug: 'star-player-b'},
                        ].map(D.playerCard).join('')}
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Team Statistics (Detailed)</h2>
                    <div class="bg-gray-50 p-6 rounded-lg shadow-md">
                        <table class="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th class="py-2 px-4 border-b">Stat</th>
                                    <th class="py-2 px-4 border-b">Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td class="py-2 px-4 border-b">Field Goal %</td><td class="py-2 px-4 border-b">${D.meta?.fg_percentage || 'N/A'}</td></tr>
                                <tr><td class="py-2 px-4 border-b">3-Point %</td><td class="py-2 px-4 border-b">${D.meta?.three_pt_percentage || 'N/A'}</td></tr>
                                <tr><td class="py-2 px-4 border-b">Rebounds Per Game</td><td class="py-2 px-4 border-b">${D.meta?.rpg || 'N/A'}</td></tr>
                                <tr><td class="py-2 px-4 border-b">Assists Per Game</td><td class="py-2 px-4 border-b">${D.meta?.apg || 'N/A'}</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="text-center mt-6">
                        <a href="/team" class="text-blue-600 hover:underline">View All Statistics</a>
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Latest Videos</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${[
                            {id: '1', youtubeId: 'VIDEO_ID_1', title: 'Game Highlights vs Opponent A', date: 'Oct 26, 2023'},
                            {id: '2', youtubeId: 'VIDEO_ID_2', title: 'Player Interview: Star Player X', date: 'Oct 25, 2023'},
                            {id: '3', youtubeId: 'VIDEO_ID_3', title: 'Behind the Scenes Training', date: 'Oct 24, 2023'},
                        ].map(D.videoCard).join('')}
                    </div>
                    <div class="text-center mt-6">
                        <a href="/videos" class="text-blue-600 hover:underline">View All Videos</a>
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Photo Mosaic</h2>
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 1" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 2" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 3" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 4" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 5" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 6" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 7" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 8" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 9" class="w-full h-auto object-cover rounded shadow">
                        <img src="https://via.placeholder.com/200x200" alt="Photo 10" class="w-full h-auto object-cover rounded shadow">
                    </div>
                    <div class="text-center mt-6">
                        <a href="/photos" class="text-blue-600 hover:underline">View All Photos</a>
                    </div>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Management Team</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div class="bg-white rounded-lg shadow-md p-6 text-center">
                            <img src="https://via.placeholder.com/150x150" alt="Manager 1" class="rounded-full mx-auto mb-4">
                            <h3 class="text-xl font-semibold">Manager One</h3>
                            <p class="text-gray-600">CEO</p>
                            <a href="/management" class="text-blue-600 hover:underline mt-2 inline-block">Learn More</a>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6 text-center">
                            <img src="https://via.placeholder.com/150x150" alt="Manager 2" class="rounded-full mx-auto mb-4">
                            <h3 class="text-xl font-semibold">Manager Two</h3>
                            <p class="text-gray-600">General Manager</p>
                            <a href="/management" class="text-blue-600 hover:underline mt-2 inline-block">Learn More</a>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-6 text-center">
                            <img src="https://via.placeholder.com/150x150" alt="Manager 3" class="rounded-full mx-auto mb-4">
                            <h3 class="text-xl font-semibold">Manager Three</h3>
                            <p class="text-gray-600">Head Coach</p>
                            <a href="/management" class="text-blue-600 hover:underline mt-2 inline-block">Learn More</a>
                        </div>
                    </div>
                </section>

                <section class="my-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-8 rounded-lg shadow-xl text-center">
                    <h2 class="text-4xl font-bold mb-4">Meet & Greet Our Stars!</h2>
                    <p class="text-xl mb-6">Exclusive opportunities to meet your favorite players.</p>
                    <a href="/meet-and-greet" class="mt-4 inline-block bg-white text-purple-700 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300 mr-4">Details</a>
                    <a href="/vip" class="mt-4 inline-block bg-white text-purple-700 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300">VIP Experiences</a>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Official Store Products</h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <div class="bg-white rounded-lg shadow-md p-4 text-center">
                            <img src="https://via.placeholder.com/200x200" alt="Product 1" class="mx-auto mb-4">
                            <h3 class="text-lg font-semibold">Team Jersey</h3>
                            <p class="text-gray-800 font-bold">$69.99</p>
                            <a href="/store/jersey" class="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Buy Now</a>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-4 text-center">
                            <img src="https://via.placeholder.com/200x200" alt="Product 2" class="mx-auto mb-4">
                            <h3 class="text-lg font-semibold">Team Cap</h3>
                            <p class="text-gray-800 font-bold">$24.99</p>
                            <a href="/store/cap" class="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Buy Now</a>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-4 text-center">
                            <img src="https://via.placeholder.com/200x200" alt="Product 3" class="mx-auto mb-4">
                            <h3 class="text-lg font-semibold">Mug</h3>
                            <p class="text-gray-800 font-bold">$14.99</p>
                            <a href="/store/mug" class="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Buy Now</a>
                        </div>
                        <div class="bg-white rounded-lg shadow-md p-4 text-center">
                            <img src="https://via.placeholder.com/200x200" alt="Product 4" class="mx-auto mb-4">
                            <h3 class="text-lg font-semibold">Keychain</h3>
                            <p class="text-gray-800 font-bold">$9.99</p>
                            <a href="/store/keychain" class="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Buy Now</a>
                        </div>
                    </div>
                    <div class="text-center mt-6">
                        <a href="/store" class="text-blue-600 hover:underline">Visit Our Store</a>
                    </div>
                </section>

                <section class="my-8 bg-gray-100 p-8 rounded-lg shadow-inner text-center">
                    <h2 class="text-3xl font-bold mb-4">Fan Center</h2>
                    <p class="text-lg mb-6">Everything for our loyal fans!</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <a href="/fans#fan-club" class="block p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors">Join Fan Club</a>
                        <a href="/fans#wallpaper" class="block p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors">Wallpapers</a>
                        <a href="/fans#contests" class="block p-4 bg-white rounded-lg shadow hover:bg-gray-50 transition-colors">Contests</a>
                    </div>
                </section>

                <section class="my-8 bg-gradient-to-r from-red-600 to-orange-500 text-white p-8 rounded-lg shadow-xl text-center">
                    <h2 class="text-4xl font-bold mb-4">Follow Riley!</h2>
                    <p class="text-xl mb-6">Our official mascot is on the loose!</p>
                    <img src="https://via.placeholder.com/800x200/FF5733/FFFFFF?text=Riley+Banner" alt="Riley Banner" class="w-full h-auto object-cover rounded shadow mb-4">
                    <a href="/fans#riley" class="mt-4 inline-block bg-white text-red-600 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300">More About Riley</a>
                </section>

                <section class="my-8">
                    <h2 class="text-3xl font-bold text-center mb-6">Connect With Us</h2>
                    <div class="flex justify-center space-x-4 mb-8">
                        <a href="https://instagram.com/indianafever" target="_blank" data-external class="text-pink-500 text-4xl hover:text-pink-600"><i class="fab fa-instagram"></i></a>
                        <a href="https://twitter.com/indianafever" target="_blank" data-external class="text-blue-400 text-4xl hover:text-blue-500"><i class="fab fa-twitter"></i></a>
                        <a href="https://facebook.com/indianafever" target="_blank" data-external class="text-blue-700 text-4xl hover:text-blue-800"><i class="fab fa-facebook"></i></a>
                        <a href="https://youtube.com/indianafever" target="_blank" data-external class="text-red-600 text-4xl hover:text-red-700"><i class="fab fa-youtube"></i></a>
                        <a href="https://tiktok.com/@indianafever" target="_blank" data-external class="text-black text-4xl hover:text-gray-800"><i class="fab fa-tiktok"></i></a>
                    </div>
                </section>

                <section class="my-8 bg-gray-50 p-8 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold text-center mb-6">Join Our Newsletter</h2>
                    ${D.formBox('/api/newsletter', 'post', [
                        {id: 'email', type: 'email', label: 'Email Address', placeholder: 'your@example.com', required: true}
                    ], 'Subscribe')}
                </section>

                <section class="my-8 bg-gray-50 p-8 rounded-lg shadow-md">
                    <h2 class="text-3xl font-bold text-center mb-6">Contact Us</h2>
                    ${D.formBox('/api/contact', 'post', [
                        {id: 'name', type: 'text', label: 'Your Name', placeholder: 'John Doe', required: true},
                        {id: 'email', type: 'email', label: 'Your Email', placeholder: 'john.doe@example.com', required: true},
                        {id: 'message', type: 'textarea', label: 'Your Message', placeholder: 'How can we help you?', required: true}
                    ], 'Send Message')}
                </section>
            </div>
        `;
    };

    // Main Router
    const render = async () => {
        const path = D.path();
        let content = '';
        const parts = path.split('/').filter(p => p); // Remove empty strings from split

        switch (true) {
            case path === '/':
                content = await D.home();
                break;
            case path === '/news':
                content = `${D.pageHero('/media/news-hero.jpg', 'Latest News')}
                    <div class="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                        ${[
                            {image: 'https://via.placeholder.com/400x250', title: 'News Article 1', date: 'Oct 26, 2023', slug: 'news-article-1'},
                            {image: 'https://via.placeholder.com/400x250', title: 'News Article 2', date: 'Oct 25, 2023', slug: 'news-article-2'},
                            {image: 'https://via.placeholder.com/400x250', title: 'News Article 3', date: 'Oct 24, 2023', slug: 'news-article-3'},
                            {image: 'https://via.placeholder.com/400x250', title: 'News Article 4', date: 'Oct 23, 2023', slug: 'news-article-4'},
                            {image: 'https://via.placeholder.com/400x250', title: 'News Article 5', date: 'Oct 22, 2023', slug: 'news-article-5'},
                            {image: 'https://via.placeholder.com/400x250', title: 'News Article 6', date: 'Oct 21, 2023', slug: 'news-article-6'},
                        ].map(D.newsCard).join('')}
                    </div>`;
                break;
            case parts[0] === 'news' && parts[1]:
                const newsSlug = parts[1];
                content = `${D.pageHero('/media/news-detail-hero.jpg', 'News Detail', newsSlug.replace(/-/g, ' '))}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-4xl font-bold mb-4">${newsSlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h2>
                        <p class="text-gray-600 mb-6">Published on Oct 26, 2023</p>
                        <img src="https://via.placeholder.com/800x450" alt="${newsSlug}" class="w-full h-auto object-cover rounded-lg shadow-md mb-8">
                        <div class="prose max-w-none">
                            <p>This is the full content of the news article about "${newsSlug.replace(/-/g, ' ')}". It would typically be loaded dynamically from an API based on the slug. This section contains detailed information, quotes, and analysis.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                            <h3>Key Takeaways</h3>
                            <ul>
                                <li>Point 1: Detailed explanation.</li>
                                <li>Point 2: Further insights.</li>
                                <li>Point 3: Future outlook.</li>
                            </ul>
                            <p>More paragraphs and rich media can be embedded here.</p>
                        </div>
                        <div class="mt-8 text-center">
                            <a href="/news" class="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">Back to All News</a>
                        </div>
                    </div>`;
                break;
            case path === '/schedule':
                content = `${D.pageHero('/media/schedule-hero.jpg', 'Full Schedule')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Our Season Schedule</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md">
                            <table class="min-w-full bg-white border border-gray-200">
                                <thead>
                                    <tr>
                                        <th class="py-3 px-6 text-left border-b-2 border-gray-200 bg-gray-100">Date</th>
                                        <th class="py-3 px-6 text-left border-b-2 border-gray-200 bg-gray-100">Opponent</th>
                                        <th class="py-3 px-6 text-left border-b-2 border-gray-200 bg-gray-100">Location</th>
                                        <th class="py-3 px-6 text-left border-b-2 border-gray-200 bg-gray-100">Time</th>
                                        <th class="py-3 px-6 text-left border-b-2 border-gray-200 bg-gray-100">Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="hover:bg-gray-50">
                                        <td class="py-3 px-6 border-b">Nov 5, 2023</td>
                                        <td class="py-3 px-6 border-b">vs Team A</td>
                                        <td class="py-3 px-6 border-b">Home Arena</td>
                                        <td class="py-3 px-6 border-b">7:00 PM EST</td>
                                        <td class="py-3 px-6 border-b text-green-600">Win (102-98)</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50">
                                        <td class="py-3 px-6 border-b">Nov 8, 2023</td>
                                        <td class="py-3 px-6 border-b">@ Team B</td>
                                        <td class="py-3 px-6 border-b">Opponent Arena</td>
                                        <td class="py-3 px-6 border-b">8:00 PM EST</td>
                                        <td class="py-3 px-6 border-b text-red-600">Loss (95-105)</td>
                                    </tr>
                                    <tr class="hover:bg-gray-50">
                                        <td class="py-3 px-6 border-b">Nov 12, 2023</td>
                                        <td class="py-3 px-6 border-b">vs Team C</td>
                                        <td class="py-3 px-6 border-b">Home Arena</td>
                                        <td class="py-3 px-6 border-b">7:30 PM EST</td>
                                        <td class="py-3 px-6 border-b">Upcoming</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>`;
                break;
            case path === '/games':
                content = `${D.pageHero('/media/games-hero.jpg', 'All Games')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Past and Upcoming Games</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${[
                                {id: 'game-1', title: 'Vs Team Alpha - Nov 5', date: 'Nov 5, 2023', score: 'Win (102-98)'},
                                {id: 'game-2', title: 'At Team Beta - Nov 8', date: 'Nov 8, 2023', score: 'Loss (95-105)'},
                                {id: 'game-3', title: 'Vs Team Gamma - Nov 12', date: 'Nov 12, 2023', score: 'Upcoming'},
                            ].map(game => `
                                <div class="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
                                    <h3 class="text-xl font-semibold mb-2">${game.title}</h3>
                                    <p class="text-gray-600 mb-2">${game.date}</p>
                                    <p class="text-lg font-bold ${game.score.includes('Win') ? 'text-green-600' : game.score.includes('Loss') ? 'text-red-600' : 'text-gray-800'}">${game.score}</p>
                                    <a href="/games/${game.id}" class="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">View Details</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
                break;
            case parts[0] === 'games' && parts[1]:
                const gameId = parts[1];
                content = `${D.pageHero('/media/game-detail-hero.jpg', 'Game Details', `Game ID: ${gameId}`)}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-4xl font-bold mb-4">Game vs Opponent X (ID: ${gameId})</h2>
                        <p class="text-gray-600 mb-6">Date: Nov 5, 2023 | Location: Home Arena</p>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <h3 class="text-2xl font-semibold mb-4">Final Score: <span class="text-green-600">102 - 98</span></h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 class="text-xl font-bold mb-2">Our Team Stats:</h4>
                                    <ul>
                                        <li>Points: 102</li>
                                        <li>Rebounds: 45</li>
                                        <li>Assists: 28</li>
                                        <li>Steals: 10</li>
                                        <li>Blocks: 5</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 class="text-xl font-bold mb-2">Opponent Stats:</h4>
                                    <ul>
                                        <li>Points: 98</li>
                                        <li>Rebounds: 40</li>
                                        <li>Assists: 22</li>
                                        <li>Steals: 8</li>
                                        <li>Blocks: 3</li>
                                    </ul>
                                </div>
                            </div>
                            <h4 class="text-xl font-bold mt-6 mb-2">Top Performers:</h4>
                            <ul>
                                <li>Player A: 25 pts, 10 reb, 7 ast</li>
                                <li>Player B: 20 pts, 5 reb, 3 ast</li>
                            </ul>
                        </div>
                        <h3 class="text-2xl font-bold mb-4">Game Recap</h3>
                        <div class="prose max-w-none mb-8">
                            <p>A thrilling game saw our team clinch a victory in the final minutes. The atmosphere was electric, with fans on their feet. Key plays in the fourth quarter secured the win.</p>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                        </div>
                        <div class="text-center">
                            <a href="/games" class="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">Back to All Games</a>
                        </div>
                    </div>`;
                break;
            case path === '/roster':
                content = `${D.pageHero('/media/roster-hero.jpg', 'Our Team Roster')}
                    <div class="container mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8">
                        ${[
                            {image: 'https://via.placeholder.com/300x400', name: 'Jane Doe', position: 'Guard', number: 1, slug: 'jane-doe'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Alice Smith', position: 'Forward', number: 2, slug: 'alice-smith'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Bob Johnson', position: 'Center', number: 3, slug: 'bob-johnson'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Charlie Brown', position: 'Guard', number: 4, slug: 'charlie-brown'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Diana Prince', position: 'Forward', number: 5, slug: 'diana-prince'},
                            {image: 'https://via.placeholder.com/300x400', name: 'Eve Adams', position: 'Guard', number: 6, slug: 'eve-adams'},
                        ].map(D.playerCard).join('')}
                    </div>`;
                break;
            case parts[0] === 'players' && parts[1]:
                const playerSlug = parts[1];
                content = `${D.pageHero('/media/player-detail-hero.jpg', 'Player Profile', playerSlug.replace(/-/g, ' '))}
                    <div class="container mx-auto p-4 my-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <img src="https://via.placeholder.com/500x700" alt="${playerSlug}" class="w-full h-auto object-cover rounded-lg shadow-md mb-6">
                            </div>
                            <div>
                                <h2 class="text-5xl font-bold mb-4">${playerSlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h2>
                                <p class="text-2xl text-gray-700 mb-4">Position: Guard | Number: 1</p>
                                <div class="bg-gray-100 p-6 rounded-lg shadow-inner mb-6">
                                    <h3 class="text-2xl font-semibold mb-4">Biography</h3>
                                    <p class="prose max-w-none">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                    <p class="prose max-w-none mt-4">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                                </div>
                                <div class="bg-gray-100 p-6 rounded-lg shadow-inner">
                                    <h3 class="text-2xl font-semibold mb-4">Key Stats</h3>
                                    <ul>
                                        <li>Points Per Game: 20.5</li>
                                        <li>Assists Per Game: 7.2</li>
                                        <li>Rebounds Per Game: 4.8</li>
                                        <li>Field Goal %: 45.3%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="mt-8 text-center">
                            <a href="/roster" class="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">Back to Roster</a>
                        </div>
                    </div>`;
                break;
            case path === '/videos':
                content = `${D.pageHero('/media/videos-hero.jpg', 'All Videos')}
                    <div class="container mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
                        ${[
                            {id: '1', youtubeId: 'VIDEO_ID_1', title: 'Game Highlights vs Opponent A', date: 'Oct 26, 2023'},
                            {id: '2', youtubeId: 'VIDEO_ID_2', title: 'Player Interview: Star Player X', date: 'Oct 25, 2023'},
                            {id: '3', youtubeId: 'VIDEO_ID_3', title: 'Behind the Scenes Training', date: 'Oct 24, 2023'},
                            {id: '4', youtubeId: 'VIDEO_ID_4', title: 'Top 10 Plays of the Month', date: 'Oct 20, 2023'},
                        ].map(D.videoCard).join('')}
                    </div>`;
                break;
            case parts[0] === 'videos' && parts[1]:
                const videoId = parts[1];
                content = `${D.pageHero('/media/video-detail-hero.jpg', 'Video Playback', `Video ID: ${videoId}`)}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-4xl font-bold mb-4">Video Title for ID: ${videoId}</h2>
                        <div class="aspect-w-16 aspect-h-9 mb-8">
                            <iframe class="w-full h-full rounded-lg shadow-md" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        </div>
                        <div class="prose max-w-none mb-8">
                            <p>This is the description for video ID ${videoId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            <p>More details about the video content would go here.</p>
                        </div>
                        <div class="mt-8 text-center">
                            <a href="/videos" class="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">Back to All Videos</a>
                        </div>
                    </div>`;
                break;
            case path === '/photos':
                content = `${D.pageHero('/media/photos-hero.jpg', 'Photo Gallery')}
                    <div class="container mx-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 my-8">
                        ${Array(20).fill(0).map((_, i) => `<img src="https://via.placeholder.com/300x300?text=Photo+${i+1}" alt="Gallery Photo ${i+1}" class="w-full h-auto object-cover rounded-lg shadow-md hover:scale-105 transition-transform duration-300">`).join('')}
                    </div>`;
                break;
            case path === '/team':
                content = `${D.pageHero('/media/team-hero.jpg', 'About Our Team')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-4xl font-bold mb-4">Our Legacy and Vision</h2>
                        <div class="prose max-w-none mb-8">
                            <p>Founded in [Year], our team has a rich history of passion, dedication, and community engagement. We strive for excellence both on and off the court, aiming to inspire our fans and achieve greatness.</p>
                            <p>Our vision is to be a leading force in the league, consistently competing at the highest level while fostering a culture of teamwork, integrity, and sportsmanship. We believe in developing not just great athletes, but great individuals.</p>
                        </div>
                        <h3 class="text-3xl font-bold mb-4">Team Values</h3>
                        <ul class="list-disc list-inside mb-8 text-lg">
                            <li><strong>Excellence:</strong> Constantly striving for the highest standards in performance.</li>
                            <li><strong>Integrity:</strong> Upholding honesty and strong moral principles.</li>
                            <li><strong>Community:</strong> Engaging with and giving back to our local community.</li>
                            <li><strong>Resilience:</strong> Overcoming challenges and bouncing back stronger.</li>
                            <li><strong>Teamwork:</strong> Collaborating and supporting each other for collective success.</li>
                        </ul>
                        <h3 class="text-3xl font-bold mb-4">Team Management</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                                <img src="https://via.placeholder.com/150x150" alt="CEO" class="rounded-full mx-auto mb-4">
                                <h4 class="text-xl font-semibold">CEO Name</h4>
                                <p class="text-gray-600">Chief Executive Officer</p>
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                                <img src="https://via.placeholder.com/150x150" alt="GM" class="rounded-full mx-auto mb-4">
                                <h4 class="text-xl font-semibold">GM Name</h4>
                                <p class="text-gray-600">General Manager</p>
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                                <img src="https://via.placeholder.com/150x150" alt="Coach" class="rounded-full mx-auto mb-4">
                                <h4 class="text-xl font-semibold">Coach Name</h4>
                                <p class="text-gray-600">Head Coach</p>
                            </div>
                        </div>
                        <div class="mt-8 text-center">
                            <a href="/management" class="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">Meet the Full Management Team</a>
                        </div>
                    </div>`;
                break;
            case path === '/events':
                content = `${D.pageHero('/media/events-hero.jpg', 'Upcoming Events')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Community and Special Events</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${[
                                {title: 'Fan Appreciation Night', date: 'Dec 1, 2023', location: 'Home Arena'},
                                {title: 'Youth Basketball Clinic', date: 'Dec 10, 2023', location: 'Community Center'},
                                {title: 'Charity Gala', date: 'Jan 15, 2024', location: 'Grand Ballroom'},
                            ].map(event => `
                                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                                    <h3 class="text-xl font-semibold mb-2">${event.title}</h3>
                                    <p class="text-gray-600 mb-1">Date: ${event.date}</p>
                                    <p class="text-gray-600">Location: ${event.location}</p>
                                    <a href="#" class="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Learn More</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
                break;
            case path === '/meet-and-greet':
                content = `${D.pageHero('/media/meet-greet-hero.jpg', 'Meet & Greet')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Player Meet & Greet Opportunities</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p class="text-lg mb-4">Get a chance to meet your favorite players, get autographs, and take photos!</p>
                            <p class="mb-4">Upcoming sessions:</p>
                            <ul class="list-disc list-inside mb-6">
                                <li>November 20, 2023 - Mall Event with Player A & B</li>
                                <li>December 5, 2023 - Arena Pre-game Session with Player C</li>
                            </ul>
                            <p class="text-red-600 font-semibold">Spaces are limited. Register now!</p>
                            ${D.formBox('/api/meet-greet-signup', 'post', [
                                {id: 'name', type: 'text', label: 'Your Name', required: true},
                                {id: 'email', type: 'email', label: 'Your Email', required: true},
                                {id: 'event', type: 'text', label: 'Preferred Event', placeholder: 'e.g., Nov 20 Mall Event', required: true}
                            ], 'Register')}
                        </div>
                    </div>`;
                break;
            case path === '/vip':
                content = `${D.pageHero('/media/vip-hero.jpg', 'VIP Experiences')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Exclusive VIP Experiences</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p class="text-lg mb-4">Elevate your game day with our premium VIP packages. Enjoy unparalleled access, luxury seating, and exclusive perks.</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div class="border p-4 rounded-lg shadow-sm">
                                    <h3 class="text-xl font-semibold mb-2">Courtside Club</h3>
                                    <p>Watch the game from the best seats in the house, with complimentary food and beverages.</p>
                                    <p class="font-bold mt-2">Price: $X,XXX</p>
                                </div>
                                <div class="border p-4 rounded-lg shadow-sm">
                                    <h3 class="text-xl font-semibold mb-2">Player Tunnel Access</h3>
                                    <p>Get a unique perspective as players enter and exit the court. Photo opportunities included.</p>
                                    <p class="font-bold mt-2">Price: $X,XXX</p>
                                </div>
                            </div>
                            <p class="text-blue-600 font-semibold">Contact us for custom VIP packages and availability.</p>
                            ${D.formBox('/api/vip-inquiry', 'post', [
                                {id: 'name', type: 'text', label: 'Your Name', required: true},
                                {id: 'email', type: 'email', label: 'Your Email', required: true},
                                {id: 'inquiry', type: 'textarea', label: 'Your Inquiry', placeholder: 'Tell us about your VIP needs', required: true}
                            ], 'Send Inquiry')}
                        </div>
                    </div>`;
                break;
            case path === '/management':
                content = `${D.pageHero('/media/management-hero.jpg', 'Our Management Team')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Leadership Driving Our Success</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                                <img src="https://via.placeholder.com/150x150" alt="Manager A" class="rounded-full mx-auto mb-4">
                                <h3 class="text-xl font-semibold">Manager Alpha</h3>
                                <p class="text-gray-600">Chief Executive Officer</p>
                                <p class="text-sm mt-2 text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                                <img src="https://via.placeholder.com/150x150" alt="Manager B" class="rounded-full mx-auto mb-4">
                                <h3 class="text-xl font-semibold">Manager Beta</h3>
                                <p class="text-gray-600">General Manager</p>
                                <p class="text-sm mt-2 text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                                <img src="https://via.placeholder.com/150x150" alt="Manager C" class="rounded-full mx-auto mb-4">
                                <h3 class="text-xl font-semibold">Manager Gamma</h3>
                                <p class="text-gray-600">Head Coach</p>
                                <p class="text-sm mt-2 text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                            <div class="bg-white rounded-lg shadow-md p-6 text-center">
                                <img src="https://via.placeholder.com/150x150" alt="Manager D" class="rounded-full mx-auto mb-4">
                                <h3 class="text-xl font-semibold">Manager Delta</h3>
                                <p class="text-gray-600">Marketing Director</p>
                                <p class="text-sm mt-2 text-gray-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </div>
                        </div>
                    </div>`;
                break;
            case path === '/store':
                content = `${D.pageHero('/media/store-hero.jpg', 'Official Team Store')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Browse Our Products</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            ${[
                                {id: 'jersey', image: 'https://via.placeholder.com/200x200', name: 'Team Jersey', price: '69.99'},
                                {id: 'cap', image: 'https://via.placeholder.com/200x200', name: 'Team Cap', price: '24.99'},
                                {id: 'mug', image: 'https://via.placeholder.com/200x200', name: 'Team Mug', price: '14.99'},
                                {id: 'scarf', image: 'https://via.placeholder.com/200x200', name: 'Team Scarf', price: '19.99'},
                                {id: 'hoodie', image: 'https://via.placeholder.com/200x200', name: 'Team Hoodie', price: '49.99'},
                                {id: 'pin', image: 'https://via.placeholder.com/200x200', name: 'Team Pin', price: '7.99'},
                            ].map(product => `
                                <div class="bg-white rounded-lg shadow-md p-4 text-center hover:shadow-lg transition-shadow duration-300">
                                    <img src="${product.image}" alt="${product.name}" class="mx-auto mb-4">
                                    <h3 class="text-lg font-semibold">${product.name}</h3>
                                    <p class="text-gray-800 font-bold">$${product.price}</p>
                                    <a href="/store/${product.id}" class="mt-2 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">View Product</a>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
                break;
            case parts[0] === 'store' && parts[1]:
                const productId = parts[1];
                content = `${D.pageHero('/media/product-detail-hero.jpg', 'Product Details', `Product ID: ${productId}`)}
                    <div class="container mx-auto p-4 my-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <img src="https://via.placeholder.com/500x500?text=${productId.toUpperCase()}" alt="${productId}" class="w-full h-auto object-cover rounded-lg shadow-md mb-6">
                            </div>
                            <div>
                                <h2 class="text-4xl font-bold mb-4">${productId.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h2>
                                <p class="text-2xl text-gray-800 font-bold mb-4">$69.99</p>
                                <p class="prose max-w-none mb-6">This is the detailed description for the ${productId.replace(/-/g, ' ')}. It's made with high-quality materials and features the official team logo. Perfect for showing your support!</p>
                                <p class="text-gray-700 mb-2"><strong>Sizes Available:</strong> S, M, L, XL, XXL</p>
                                <p class="text-gray-700 mb-6"><strong>Color:</strong> Blue, Red, White</p>
                                <button class="bg-green-500 text-white py-3 px-8 rounded-full text-lg hover:bg-green-600">Add to Cart</button>
                            </div>
                        </div>
                        <div class="mt-8 text-center">
                            <a href="/store" class="inline-block bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600">Back to Store</a>
                        </div>
                    </div>`;
                break;
            case path === '/cart':
                content = `${D.pageHero('/media/cart-hero.jpg', 'Shopping Cart')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Your Items</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <div class="flex justify-between items-center border-b pb-4 mb-4">
                                <div class="flex items-center">
                                    <img src="https://via.placeholder.com/80x80" alt="Item 1" class="w-20 h-20 object-cover rounded mr-4">
                                    <div>
                                        <h3 class="text-xl font-semibold">Team Jersey</h3>
                                        <p class="text-gray-600">Size: L, Color: Blue</p>
                                    </div>
                                </div>
                                <div class="text-lg font-bold">$69.99 x 1</div>
                                <button class="text-red-500 hover:text-red-700">Remove</button>
                            </div>
                            <div class="flex justify-between items-center border-b pb-4 mb-4">
                                <div class="flex items-center">
                                    <img src="https://via.placeholder.com/80x80" alt="Item 2" class="w-20 h-20 object-cover rounded mr-4">
                                    <div>
                                        <h3 class="text-xl font-semibold">Team Cap</h3>
                                        <p class="text-gray-600">Color: Red</p>
                                    </div>
                                </div>
                                <div class="text-lg font-bold">$24.99 x 2</div>
                                <button class="text-red-500 hover:text-red-700">Remove</button>
                            </div>
                            <div class="text-right text-2xl font-bold mt-8">
                                Total: $119.97
                            </div>
                            <div class="text-center mt-8">
                                <a href="/checkout" class="inline-block bg-green-500 text-white py-3 px-8 rounded-full text-lg hover:bg-green-600">Proceed to Checkout</a>
                            </div>
                        </div>
                    </div>`;
                break;
            case path === '/checkout':
                content = `${D.pageHero('/media/checkout-hero.jpg', 'Checkout')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Complete Your Order</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-2xl font-bold mb-4">Shipping Information</h3>
                                ${D.formBox('/api/checkout-shipping', 'post', [
                                    {id: 'fullName', type: 'text', label: 'Full Name', required: true},
                                    {id: 'address1', type: 'text', label: 'Address Line 1', required: true},
                                    {id: 'address2', type: 'text', label: 'Address Line 2', placeholder: 'Apartment, suite, etc.'},
                                    {id: 'city', type: 'text', label: 'City', required: true},
                                    {id: 'state', type: 'text', label: 'State/Province', required: true},
                                    {id: 'zip', type: 'text', label: 'Zip/Postal Code', required: true},
                                    {id: 'country', type: 'text', label: 'Country', required: true}
                                ], 'Continue to Payment')}
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow-md">
                                <h3 class="text-2xl font-bold mb-4">Order Summary</h3>
                                <div class="mb-4">
                                    <div class="flex justify-between mb-2"><span>Team Jersey</span><span>$69.99</span></div>
                                    <div class="flex justify-between mb-2"><span>Team Cap x 2</span><span>$49.98</span></div>
                                    <div class="flex justify-between border-t border-gray-300 pt-4 mt-4 text-xl font-bold"><span>Total</span><span>$119.97</span></div>
                                </div>
                                <h3 class="text-2xl font-bold mb-4 mt-8">Payment Information</h3>
                                ${D.formBox('/api/checkout-payment', 'post', [
                                    {id: 'cardNumber', type: 'text', label: 'Card Number', required: true, placeholder: 'XXXX XXXX XXXX XXXX'},
                                    {id: 'expiryDate', type: 'text', label: 'Expiry Date', required: true, placeholder: 'MM/YY'},
                                    {id: 'cvv', type: 'text', label: 'CVV', required: true, placeholder: 'XXX'},
                                ], 'Place Order')}
                            </div>
                        </div>
                    </div>`;
                break;
            case path === '/fans':
                content = `${D.pageHero('/media/fans-hero.jpg', 'Fan Center')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Everything for Our Loyal Supporters</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 id="fan-club" class="text-xl font-semibold mb-2">Fan Club</h3>
                                <p>Join our official fan club for exclusive content, discounts, and events.</p>
                                <button class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Join Now</button>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 id="wallpaper" class="text-xl font-semibold mb-2">Wallpapers</h3>
                                <p>Download high-resolution wallpapers for your desktop and mobile devices.</p>
                                <button class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Browse Wallpapers</button>
                            </div>
                            <div class="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 id="contests" class="text-xl font-semibold mb-2">Contests & Giveaways</h3>
                                <p>Participate in our contests for a chance to win signed merchandise and tickets.</p>
                                <button class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Enter Now</button>
                            </div>
                             <div class="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 id="riley" class="text-xl font-semibold mb-2">Meet Riley</h3>
                                <p>Get to know our beloved mascot, Riley! Find out where Riley will be next.</p>
                                <button class="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Riley's Schedule</button>
                            </div>
                        </div>
                    </div>`;
                break;
            case path === '/updates':
                content = `${D.pageHero('/media/updates-hero.jpg', 'Team Updates')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Latest Team Announcements</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <div class="mb-4 pb-4 border-b">
                                <h3 class="text-xl font-semibold">Important Announcement 1</h3>
                                <p class="text-gray-600 text-sm mb-2">Posted: Oct 26, 2023</p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                            </div>
                            <div class="mb-4 pb-4 border-b">
                                <h3 class="text-xl font-semibold">Important Announcement 2</h3>
                                <p class="text-gray-600 text-sm mb-2">Posted: Oct 20, 2023</p>
                                <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                            </div>
                            <div class="pb-4">
                                <h3 class="text-xl font-semibold">Important Announcement 3</h3>
                                <p class="text-gray-600 text-sm mb-2">Posted: Oct 15, 2023</p>
                                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                            </div>
                        </div>
                    </div>`;
                break;
            case path === '/ai':
                content = `${D.pageHero('/media/ai-hero.jpg', 'AI Integration')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Our AI Initiatives</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p class="text-lg mb-4">We're leveraging cutting-edge Artificial Intelligence to enhance player performance analysis, fan engagement, and operational efficiency.</p>
                            <p class="mb-4">Our AI systems analyze vast amounts of data to provide insights into game strategies, player health, and personalized fan experiences.</p>
                            <h3 class="text-2xl font-semibold mb-4 mt-6">Current Applications:</h3>
                            <ul class="list-disc list-inside mb-6">
                                <li><strong>Player Performance Metrics:</strong> Advanced analytics for training and in-game decisions.</li>
                                <li><strong>Fan Experience Personalization:</strong> Tailoring content and offers based on fan preferences.</li>
                                <li><strong>Predictive Analytics:</strong> Forecasting game outcomes and player potential.</li>
                            </ul>
                            <p class="text-blue-600 font-semibold">Stay tuned for more exciting developments in AI at Point Goddess Basketball!</p>
                        </div>
                    </div>`;
                break;
            case path === '/contact':
                content = `${D.pageHero('/media/contact-hero.jpg', 'Contact Us')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Get in Touch</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p class="text-lg mb-4 text-center">Have a question or comment? Fill out the form below or reach us directly.</p>
                            ${D.formBox('/api/contact', 'post', [
                                {id: 'name', type: 'text', label: 'Your Name', placeholder: 'John Doe', required: true},
                                {id: 'email', type: 'email', label: 'Your Email', placeholder: 'john.doe@example.com', required: true},
                                {id: 'subject', type: 'text', label: 'Subject', placeholder: 'General Inquiry', required: true},
                                {id: 'message', type: 'textarea', label: 'Your Message', placeholder: 'How can we help you?', required: true}
                            ], 'Send Message')}
                            <div class="mt-8 text-center">
                                <p class="text-xl font-semibold">Email: <a href="mailto:info@pointgoddess.com" class="text-blue-600 hover:underline">info@pointgoddess.com</a></p>
                                <p class="text-xl font-semibold">Phone: <a href="tel:+15551234567" class="text-blue-600 hover:underline">+1 (555) 123-4567</a></p>
                                <p class="text-xl font-semibold">Address: 123 Arena Way, City, State, ZIP</p>
                            </div>
                        </div>
                    </div>`;
                break;
            case path === '/support':
                content = `${D.pageHero('/media/support-hero.jpg', 'Support Center')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">How Can We Help?</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p class="text-lg mb-4">Visit our FAQs or submit a support ticket for assistance with common issues, account problems, or general inquiries.</p>
                            <h3 class="text-2xl font-semibold mb-4 mt-6">Frequently Asked Questions</h3>
                            <div class="mb-4">
                                <h4 class="font-bold text-lg">Q: How do I reset my password?</h4>
                                <p>A: Go to the account page and click on 'Forgot Password'.</p>
                            </div>
                            <div class="mb-4">
                                <h4 class="font-bold text-lg">Q: Where can I find game highlights?</h4>
                                <p>A: All game highlights are available in the <a href="/videos" class="text-blue-600 hover:underline">Videos</a> section.</p>
                            </div>
                            <h3 class="text-2xl font-semibold mb-4 mt-6">Submit a Support Ticket</h3>
                            ${D.formBox('/api/support', 'post', [
                                {id: 'name', type: 'text', label: 'Your Name', required: true},
                                {id: 'email', type: 'email', label: 'Your Email', required: true},
                                {id: 'issueType', type: 'text', label: 'Issue Type', placeholder: 'e.g., Account, Order, Technical', required: true},
                                {id: 'description', type: 'textarea', label: 'Description', placeholder: 'Please describe your issue in detail.', required: true}
                            ], 'Submit Ticket')}
                        </div>
                    </div>`;
                break;
            case path === '/account':
                content = `${D.pageHero('/media/account-hero.jpg', 'My Account')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Welcome, User!</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p class="text-lg mb-4">Manage your profile, view order history, and update your preferences.</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 class="text-2xl font-semibold mb-4">Profile Information</h3>
                                    <p><strong>Name:</strong> John Doe</p>
                                    <p><strong>Email:</strong> john.doe@example.com</p>
                                    <p class="mt-4"><a href="#" class="text-blue-600 hover:underline">Edit Profile</a> | <a href="#" class="text-red-600 hover:underline">Change Password</a></p>
                                </div>
                                <div>
                                    <h3 class="text-2xl font-semibold mb-4">Order History</h3>
                                    <ul>
                                        <li class="mb-2">Order #12345 - Nov 1, 2023 - $119.97 - <a href="#" class="text-blue-600 hover:underline">View Details</a></li>
                                        <li class="mb-2">Order #12344 - Oct 20, 2023 - $69.99 - <a href="#" class="text-blue-600 hover:underline">View Details</a></li>
                                    </ul>
                                    <p class="mt-4"><a href="#" class="text-blue-600 hover:underline">View All Orders</a></p>
                                </div>
                            </div>
                        </div>
                    </div>`;
                break;
            case path === '/about':
                content = `${D.pageHero('/media/about-hero.jpg', 'About Us')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Our Story</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
                            <p class="text-lg mb-4">Point Goddess Basketball was founded with a vision to bring exciting, competitive, and inspiring basketball to our community.</p>
                            <p class="mb-4">From humble beginnings, we have grown into a formidable team, consistently pushing the boundaries of what's possible on the court. Our success is built on the hard work of our players, the dedication of our staff, and the unwavering support of our fans.</p>
                            <p class="mb-4">We are more than just a basketball team; we are a family, united by a love for the game and a commitment to excellence.</p>
                            <h3 class="text-2xl font-semibold mb-4 mt-6">Our Mission</h3>
                            <p class="prose max-w-none">To inspire, entertain, and unite our community through the power of basketball, while striving for championship success and fostering a culture of positive impact.</p>
                        </div>
                    </div>`;
                break;
            case path === '/admin':
                content = `${D.pageHero('/media/admin-hero.jpg', 'Admin Panel')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Restricted Access: Administration</h2>
                        <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
                            <p class="font-bold">Access Denied</p>
                            <p>You do not have sufficient permissions to view this page. Please log in with an administrator account.</p>
                        </div>
                        ${D.formBox('/api/admin-login', 'post', [
                            {id: 'username', type: 'text', label: 'Username', required: true},
                            {id: 'password', type: 'password', label: 'Password', required: true}
                        ], 'Admin Login')}
                    </div>`;
                break;
            case path === '/privacy':
                content = `${D.pageHero('/media/privacy-hero.jpg', 'Privacy Policy')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Our Commitment to Your Privacy</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8 prose max-w-none">
                            <p>This Privacy Policy describes how Point Goddess Basketball collects, uses, and shares your personal information when you visit or make a purchase from the Site.</p>
                            <h3>What Personal Information We Collect</h3>
                            <p>When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support.</p>
                            <h3>How We Use Your Personal Information</h3>
                            <p>We use your personal information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.</p>
                            <h3>Sharing Your Personal Information</h3>
                            <p>We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example, we use Stripe to power our online store—you can read more about how Stripe uses your Personal Information here: <a href="https://stripe.com/privacy" target="_blank" data-external>https://stripe.com/privacy</a>.</p>
                            <h3>Your Rights</h3>
                            <p>If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or erased. If you would like to exercise this right, please contact us through the contact information below.</p>
                        </div>
                    </div>`;
                break;
            case path === '/terms':
                content = `${D.pageHero('/media/terms-hero.jpg', 'Terms of Service')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Terms and Conditions of Use</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8 prose max-w-none">
                            <p>Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service.</p>
                            <h3>Online Store Terms</h3>
                            <p>By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.</p>
                            <h3>General Conditions</h3>
                            <p>We reserve the right to refuse service to anyone for any reason at any time. You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.</p>
                            <h3>Accuracy, Completeness and Timeliness of Information</h3>
                            <p>We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.</p>
                        </div>
                    </div>`;
                break;
            case path === '/cookies':
                content = `${D.pageHero('/media/cookies-hero.jpg', 'Cookie Policy')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Our Use of Cookies</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8 prose max-w-none">
                            <p>This Cookie Policy explains what cookies are and how we use them. You should read this policy to understand what cookies are, how we use them, the types of cookies we use i.e, the information we collect using cookies and how that information is used and how to control the cookie preferences. For further information on how we use, store and keep your personal data secure, see our Privacy Policy.</p>
                            <h3>What are cookies?</h3>
                            <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
                            <h3>How do we use cookies?</h3>
                            <p>We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Websites to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties.</p>
                            <h3>What types of cookies do we use?</h3>
                            <p>We use different types of cookies on our website:</p>
                            <ul>
                                <li><strong>Essential Cookies:</strong> Necessary for the website to function properly.</li>
                                <li><strong>Performance and Functionality Cookies:</strong> Help to enhance the performance and functionality of our website.</li>
                                <li><strong>Analytics and Customization Cookies:</strong> Collect information that is used either in aggregate form to help us understand how our Websites are being used or how effective our marketing campaigns are, or to help us customize our Websites for you.</li>
                            </ul>
                            <h3>How to control cookie preferences</h3>
                            <p>You can manage your cookie preferences through your browser settings. Most browsers allow you to refuse or accept cookies and to delete cookies.</p>
                        </div>
                    </div>`;
                break;
            case path === '/accessibility':
                content = `${D.pageHero('/media/accessibility-hero.jpg', 'Accessibility Statement')}
                    <div class="container mx-auto p-4 my-8">
                        <h2 class="text-3xl font-bold text-center mb-6">Our Commitment to Accessibility</h2>
                        <div class="bg-white p-6 rounded-lg shadow-md mb-8 prose max-w-none">
                            <p>Point Goddess Basketball is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone, and applying the relevant accessibility standards.</p>
                            <h3>Measures to support accessibility</h3>
                            <p>Point Goddess Basketball takes the following measures to ensure accessibility of our website:</p>
                            <ul>
                                <li>Include accessibility throughout our internal policies.</li>
                                <li>Provide continual accessibility training for our staff.</li>
                                <li>Assign clear accessibility goals and responsibilities.</li>
                                <li>Employ formal accessibility quality assurance methods.</li>
                            </ul>
                            <h3>Conformance status</h3>
                            <p>The <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: A, AA, and AAA. Our website is partially conformant with WCAG 2.1 level AA.</p>
                            <h3>Feedback</h3>
                            <p>We welcome your feedback on the accessibility of our website. Please let us know if you encounter accessibility barriers on our website:</p>
                            <ul>
                                <li>E-mail: <a href="mailto:accessibility@pointgoddess.com" class="text-blue-600 hover:underline">accessibility@pointgoddess.com</a></li>
                                <li>Phone: <a href="tel:+15559876543" class="text-blue-600 hover:underline">+1 (555) 987-6543</a></li>
                            </ul>
                        </div>
                    </div>`;
                break;
            default:
                content = `${D.pageHero('/media/404-hero.jpg', 'Page Not Found', 'The page you requested does not exist.')}
                    <div class="container mx-auto p-4 text-center my-8">
                        <p class="text-xl mb-4">We're sorry, but we can't find the page you're looking for.</p>
                        <p class="mb-8">It might have been moved, deleted, or you might have typed the address incorrectly.</p>
                        <a href="/" class="inline-block bg-blue-500 text-white py-3 px-8 rounded-full text-lg hover:bg-blue-600">Go to Homepage</a>
                    </div>`;
        }
        app.innerHTML = content;

        // Re-attach event listeners for dynamically added forms/buttons if necessary
        const rileyForm = document.getElementById('rf');
        if (rileyForm) {
            rileyForm.removeEventListener('submit', rileyFormHandler); // Prevent duplicate listeners
            rileyForm.addEventListener('submit', rileyFormHandler);
        }

        const hamButton = document.getElementById('ham');
        const drawer = document.getElementById('drawer');
        if (hamButton && drawer) {
            hamButton.onclick = () => {
                drawer.classList.toggle('hidden');
            };
        }

        const rileyFab = document.getElementById('rileyFab');
        const rileyChat = document.getElementById('riley'); // Assuming #riley is the chat interface
        if (rileyFab && rileyChat) {
            rileyFab.onclick = () => {
                rileyChat.classList.toggle('hidden');
            };
        }

        const searchInput = document.getElementById('q');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.toLowerCase();
                    if (query.includes('next game')) {
                        navigate('/games/next'); // Placeholder for next game
                    } else if (query.includes('news')) {
                        navigate('/news');
                    } else if (query.includes('store')) {
                        navigate('/store');
                    } else if (query.includes('meet')) {
                        navigate('/meet-and-greet');
                    } else if (query.includes('vip')) {
                        navigate('/vip');
                    } else if (query.includes('management')) {
                        navigate('/management');
                    } else if (query.includes('video')) {
                        navigate('/videos');
                    } else if (query.includes('photo')) {
                        navigate('/photos');
                    } else if (query.includes('event')) {
                        navigate('/events');
                    } else if (query.includes('whatsapp')) {
                        window.open('https://wa.me/15551234567', '_blank'); // Example WhatsApp link
                    } else {
                        alert(`No direct route for "${query}". Try navigating via the menu.`);
                    }
                }
            });
        }
    };

    // Initialize D.meta if it doesn't exist
    D.meta = D.meta || {
        wins: 0,
        losses: 0,
        ppg: 0,
        fg_percentage: '0%',
        three_pt_percentage: '0%',
        rpg: 0,
        apg: 0
    };

    // Initial render
    render();

    // Attach Riley form dynamically after initial render
    setTimeout(() => {
        if (!document.getElementById('rf')) { // Only add if not present from initial render (e.g., if Riley chat is a modal)
            const rileyChatContainer = document.getElementById('riley');
            if (rileyChatContainer) {
                rileyChatContainer.innerHTML = `
                    <div class="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80 z-50 hidden" id="riley">
                        <h3 class="text-xl font-bold mb-4">Riley Assistant</h3>
                        ${D.formBox('/api/riley-inquiry', 'post', [
                            {id: 'query', type: 'textarea', label: 'Your Question', placeholder: 'Ask Riley anything...', required: true},
                            {id: 'topic', type: 'select', label: 'Topic', options: ['Next Game', 'News', 'Store', 'Meet & Greet', 'VIP', 'Management', 'Video', 'Photo', 'Event', 'WhatsApp'], required: true}
                        ], 'Ask Riley', 'rf')}
                        <button id="rileyFab" class="fixed bottom-4 right-4 bg-purple-600 text-white rounded-full p-4 shadow-lg hover:bg-purple-700 focus:outline-none z-50">
                            <i class="fas fa-robot text-2xl"></i>
                        </button>
                    </div>
                `;
                 // Re-attach handler for the newly rendered form
                const rileyForm = document.getElementById('rf');
                if (rileyForm) {
                    rileyForm.removeEventListener('submit', rileyFormHandler);
                    rileyForm.addEventListener('submit', rileyFormHandler);
                }
            }
        }
    }, 100); // Small delay to ensure #riley element might be present if it's part of the static HTML or another script.
})(window.IFMS = window.IFMS || {});
