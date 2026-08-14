import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">Sacred Heart LMS</h3>
            <p className="text-blue-200">
              Empowering young minds through gamified learning experiences for Grade 1-3 students.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-blue-200 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/courses" className="text-blue-200 hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/location" className="text-blue-200 hover:text-white transition-colors">Location</Link></li>
              <li><Link href="/blog" className="text-blue-200 hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-blue-200 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="text-blue-200 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/help" className="text-blue-200 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="text-blue-200 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-blue-200">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Sacred Heart School of Butuan, Inc.</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@sacredheart.edu.ph</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+63 (XX) XXX-XXXX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
          <p>&copy; {new Date().getFullYear()} Sacred Heart School of Butuan, Inc. All rights reserved.</p>
          <p className="mt-2 text-sm">Developed for enhancing student engagement and academic performance.</p>
        </div>
      </div>
    </footer>
  );
}
