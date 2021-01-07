import { Component } from '@loopback/core';
import { BodyParser, createBodyParserBinding } from '@loopback/rest';
import { Utils } from './utility';

export class XmlBodyParser extends Utils implements BodyParser {
  constructor() {
    super();
  }

  supports(mediaType: string): boolean {
    console.log('here');
    throw new Error('Method not implemented.');
  }
  parse(request: import('express').Request<any>): Promise<import('@loopback/rest').RequestBody> {
    let body: any = [];
    return new Promise((resolve, reject) => {
      request
        .on('data', (chunk) => {
          body.push(chunk);
        })
        .on('end', () => {
          // at this point, `body` has the entire request body stored in it as a string
          body = Buffer.concat(body).toString();
          if (body) {
            console.log('resolve', typeof body);
            return resolve({ value: body });
          } else {
            console.log('reject');
            return reject({ value: body });
          }
        });
    });
  }
  name = 'xml';
}

export class XmlComponent implements Component {
  bindings = [createBodyParserBinding(XmlBodyParser)];
}
