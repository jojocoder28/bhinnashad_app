

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  const staffRoutes = ['/admin', '/manager', '/waiter'];
  const customerRoutes = ['/my-orders'];
  const publicRoutes = ['/login', '/signup', '/unauthorized', '/menu', '/about', '/contact'];

  const isStaffRoute = staffRoutes.some(route => pathname.startsWith(route));
  const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route));

  // If there is no session
  if (!session) {
    // Protect staff and customer routes
    if (isStaffRoute || isCustomerRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If at root, redirect to menu for non-logged-in users
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/menu', request.url));
    }
    return NextResponse.next();
  }

  // If there is a session
  if (session) {
    // Redirect logged-in users away from login/signup
    if (pathname === '/login' || pathname === '/signup') {
       if (session.role === 'user') {
         return NextResponse.redirect(new URL('/my-orders', request.url));
       }
       return NextResponse.redirect(new URL(`/${session.role}`, request.url));
    }
    
    // Redirect from root based on role
    if (pathname === '/') {
       if (session.role === 'user') {
         return NextResponse.redirect(new URL('/my-orders', request.url));
       }
       return NextResponse.redirect(new URL(`/${session.role}`, request.url));
    }

    // Role-based access control for staff routes
    if (pathname.startsWith('/admin') && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/manager') && !['admin', 'manager'].includes(session.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/waiter') && !['admin', 'waiter'].includes(session.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    if (pathname.startsWith('/kitchen')) { // Redirect any kitchen access attempts
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Protect customer routes from staff
    if(isCustomerRoute && session.role !== 'user') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Protect staff routes from customers
    if(isStaffRoute && session.role === 'user') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
