import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';


const Home = () => {
  const navigate = useNavigate();

  const redirectToTrips = () => {
    navigate('/trips');
  };

  return (
<div className="container mt-5">
  <h1 className="text-center mb-4 text-forest-green">TripTrek: Where Adventures Begin with a Plan</h1>

  <div className="mb-4">
    <Carousel showThumbs={false} autoPlay={true} infiniteLoop={true} showStatus={false} stopOnHover={false}>
      <div>
        <div style={{ height: '500px' }}>
          <img
            src="./images/Venice.jpg"
            alt="Venice"
            className="img-fluid w-100 h-100 object-fit-cover"
          />
        </div>
        <div className="bg-terra text-white py-2 text-center mb-5">
          Turn Dreams Into Destinations
        </div>
      </div>

      <div>
        <div style={{ height: '500px' }}>
          <img
            src="./images/Switzerland.jpg"
            alt="Swiss Alps"
            className="img-fluid w-100 h-100 object-fit-cover"
          />
        </div>
        <div className="bg-terra text-white py-2 text-center mb-5">
          Every Stop, Right Where It Belongs
        </div>
      </div>

      <div>
        <div style={{ height: '500px' }}>
          <img
            src="./images/hike.jpg"
            alt="Hike in the woods"
            className="img-fluid w-100 h-100 object-fit-cover"
          />
        </div>
        <div className="bg-terra text-white py-2 text-center mb-5">
          Don’t Just Travel. Trek with a Plan.
        </div>
      </div>

      <div>
        <div style={{ height: '500px' }}>
          <img
            src="./images/MountEverest.jpg"
            alt="Climbing Mount Everest"
            className="img-fluid w-100 h-100 object-fit-cover"
          />
        </div>
        <div className="bg-terra text-white py-2 text-center mb-5">
          No More Guesswork – Just Great Adventures
        </div>
      </div>

      <div>
        <div style={{ height: '500px' }}>
          <img
            src="./images/beach.jpg"
            alt="Beach with palm trees"
            className="img-fluid w-100 h-100 object-fit-cover"
          />
        </div>
        <div className="bg-terra text-white py-2 text-center mb-5">
          Because the Best Trips Start with a Plan
        </div>
      </div>
    </Carousel>
  </div>

  <button className="btn btn-terra shadow mb-4 d-block mx-auto btn-pop" onClick={redirectToTrips}>
    Plan Your Next Trip
  </button>
</div>
  );
};

export default Home;

