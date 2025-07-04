
function ContactUs() {
  return (
    <div className="contact-container py-5">
      <div className="container">
        <h2 className="text-center mb-4 text-forest-green">Contact Us</h2>
        <p className="text-center mb-5 text-slate-gray">
          Have questions about your itinerary or need help planning your next trip? Reach out to us!
        </p>

        <div className="row justify-content-center">
          <div className="col-md-8">
            <form className="p-4 shadow rounded bg-white-custom">
              <div className="mb-3">
                <label htmlFor="name" className="form-label text-slate-gray">Name</label>
                <input type="text" className="form-control" id="name" placeholder="Your name" />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label text-slate-gray">Email</label>
                <input type="email" className="form-control" id="email" placeholder="your@email.com" />
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="form-label text-slate-gray">Message</label>
                <textarea className="form-control" id="message" rows="5" placeholder="How can we help?"></textarea>
              </div>
              <button type="submit" className="btn btn-terra w-100">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
