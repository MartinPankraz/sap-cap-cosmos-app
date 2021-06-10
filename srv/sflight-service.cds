using {cosmos as external} from './external/cosmos.csn';

service SflightService {

    @readonly
    entity Sflight as projection on external.Sflight {
        key id, carrid, connid, fldate, planetype, seatsmax, seatsocc
    };

}