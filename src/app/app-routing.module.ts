import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'attendance',
    loadChildren: () => import('./attendance/attendance.module').then( m => m.AttendancePageModule)
  },
  {
    path: 'dar',
    loadChildren: () => import('./dar/dar.module').then( m => m.DarPageModule)
  },
  {
    path: 'leave-filing',
    loadChildren: () => import('./leave-filing/leave-filing.module').then( m => m.LeaveFilingPageModule)
  },
  {
    path: 'location',
    loadChildren: () => import('./location/location.module').then( m => m.LocationPageModule)
  },
  {
    path: 'ot-filing',
    loadChildren: () => import('./ot-filing/ot-filing.module').then( m => m.OtFilingPageModule)
  },
  {
    path: 'projects',
    loadChildren: () => import('./projects/projects.module').then( m => m.ProjectsPageModule)
  },
  {
    path: 'project-members',
    loadChildren: () => import('./project-members/project-members.module').then( m => m.ProjectMembersPageModule)
  },
  {
    path: 'view-project',
    loadChildren: () => import('./view-project/view-project.module').then( m => m.ViewProjectPageModule)
  },
  {
    path: 'summaries',
    loadChildren: () => import('./summaries/summaries.module').then( m => m.SummariesPageModule)
  },
  {
    path: 'view-attendance',
    loadChildren: () => import('./view-attendance/view-attendance.module').then( m => m.ViewAttendancePageModule)
  },
  {
    path: 'view-summary',
    loadChildren: () => import('./view-summary/view-summary.module').then( m => m.ViewSummaryPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
