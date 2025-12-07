import { Injectable } from '@nestjs/common';


@Injectable({})
export class AuthService {
    signup() {
        return {message: "you are signup"}
    }


    signin() {
        return {message: "you are signin"}
    }
}
