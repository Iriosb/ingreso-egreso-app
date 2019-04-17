
export class User {

    public uid: string;
    public nombre: string;
    public email: string;
   
    constructor(obj: dataObj) {

        this.uid    = obj && obj.uid || null ;
        this.nombre = obj && obj.nombre || null ;
        this.email  = obj && obj.email || null ;
        
    }
}

interface dataObj {
    uid: string;
    nombre: string;
    email: string;
}