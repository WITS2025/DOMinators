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
      <h1 className="text-center mb-4 text-forest-green">Plan Your Next Adventure</h1>
      
      <div className="mb-4">
        <Carousel showThumbs={false} autoPlay={true} infiniteLoop={true}>
          <div>
            <img src="/images/Venice.jpg" alt="Venice" />
            <p className="legend">Venice</p>
          </div>
          <div>
            <img src="/images/Switzerland.jpg" alt="Switzerland" />
            <p className="legend">Switzerland</p>
          </div>
          <div>
            <img src="/images/banff.jpg" alt="Banff" />
            <p className="legend">Banff</p>
          </div>
      
        </Carousel>
      </div>

      <button className="btn btn-terra btn-block" onClick={redirectToTrips}>
         Plan Next Trip
      </button>
    </div>
  );
};

export default Home;

