import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";


// Pages
import Dashboard from "@/pages/dashboard";
import MainCategoryPage from "@/pages/main-category";
import CategorySection from "@/pages/category";
import SectionPage from "./pages/SectionPage";
import TopicPage from "./pages/TopicPage";
import BooksPage from "./pages/BooksPage";
import NewBookPage from "./pages/new-book-page";
import EditBookPage from "./pages/books-edit-form-page";
import EbooksPage from "./pages/EbooksPage";
import NewEbookPage from "./pages/new-ebook-page";
import EditEbookPage from "./pages/edit-ebook-page";
import CoursesPage from "@/pages/courses";
import NewCoursePage from "@/pages/new-course-form-page";
import EditCoursePage from "@/pages/edit-course-form";
import CourseClassesPage from "@/pages/course-classes";
import NewCourseClassPage from "@/pages/class-form-page-new";
import EditCourseClassPage from "@/pages/edit-classform";
import CoursePdfsPage from "@/pages/online-course-pdfs";
import NewCoursePdfPage from "@/pages/new-pdf-form-page";
import EditCoursePdfPage from "@/pages/edit-form-pdf";
import NotFound from "@/pages/not-found";
import ContactUsEnquiryPage from './pages/ContactUsEnquiryPage';
import InAppNotificationPage from "@/pages/InAppNotificationPage"; 
import NewNotificationPage from "@/pages/NewNotificationPage";   
import EditNotificationPage from "@/pages/EditNotificationPage";
import OrderManagementPage from "@/pages/OrderManagementPage"; 
import AssignClassPage from "@/pages/AssignClassPage"; 
import UsersPage from "@/pages/UsersPage"; 
import AssignPdfPage from "./pages/AssignPdfPage";
import BannersPage from './pages/BannersPage'; 
import AddBannerPage from './pages/AddBannerPage';   
import EditBannerPage from './pages/EditBannerPage';
import CouponsPage from './pages/CouponsPage';
import AddCouponPage from './pages/AddCouponPage';
import EditCouponPage from './pages/EditCouponPage';
import SubscriptionsPage from './pages/subscriptionsPage';    
import NewSubscriptionPage from './pages/subscriptions-new-page';    
import EditSubscriptionPage from './pages/subscriptions-edit-[id]-page';   
import SeoUrlsPage from './pages/SeoUrlsPage';
import NewSeoUrlPage from './pages/NewSeoUrlPage';
import EditSeoUrlPage from './pages/EditSeoUrlPage';
import PackagesPage from './pages/PackagesPage';   
import NewPackagePage from './pages/NewPackagePage';              
// import EditPackagePage from './pages/EditPackagePage';             
// import AssignSeriesPage from './pages/AssignSeriesPage';
import PracticeBatchesPage from './pages/PracticeBatchesPage';
import NewPracticeBatchPage from './pages/NewPracticeBatchPage';
// import EditPracticeBatchPage from './pages/EditPracticeBatchPage';
// import AssignToBatchPage from './pages/AssignToBatchPage';
import InstructionsPage from './pages/InstructionsPage';     
import NewInstructionPage from './pages/NewInstructionPage';   
import EditInstructionPage from './pages/EditInstructionPage';  
import DuplicateQuestionPage from './pages/DuplicateQuestionPage'; 
import AllQuestionsPage from './pages/AllQuestionsPage';     
import NewQuestionPage from './pages/NewQuestionPage';       
// import EditQuestionPage from './pages/EditQuestionPage';  
import SubTopicsPage from './pages/SubTopicsPage';
import NewSubTopicPage from './pages/NewSubTopicPage';
import EditSubTopicPage from './pages/EditSubTopicPage';
import SeriesPage from './pages/SeriesPage';                 
import NewSeriesPage from './pages/NewSeriesPage';               
// import EditSeriesPage from './pages/EditSeriesPage';              
// import AssignQuestionsToSeriesPage from './pages/AssignQuestionsToSeriesPage'; 






import { useLocation } from "wouter";

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/books/edit/")) return "Edit Book";
  if (pathname.startsWith("/ebooks/edit/")) return "Edit E-book";
  if (pathname.startsWith("/courses/edit/")) return "Edit Course";
  if (pathname.startsWith("/course-classes/edit/")) return "Edit Course Class";
  if (pathname.startsWith("/online-course-pdfs/edit/")) return "Edit Course PDF";
  if (pathname.startsWith("/banners/edit/")) return "Edit Banner"; 
  if (pathname.startsWith("/coupons/edit/")) return "Edit Coupon";
  if (pathname.startsWith("/subscriptions/edit/")) return "Edit Subscription"; 
  if (pathname.startsWith("/seo-urls/edit/")) return "Edit SEO URL"; 
  if (pathname.startsWith("/packages/edit/")) return "Edit Package";           
  if (pathname.startsWith("/packages/assign-series/")) return "Assign Series";
  if (pathname.startsWith("/practice-batch/edit/")) return "Edit Batch";        
  if (pathname.startsWith("/practice-batch/assign/")) return "Assign to Batch"; 
  if (pathname.startsWith("/instructions/edit/")) return "Edit Instruction"; 
  if (pathname.startsWith("/questions/edit/")) return "Edit Question"; 
  if (pathname.startsWith("/sub-topics/edit/")) return "Edit Sub-Topic";
  if (pathname.startsWith("/series/edit")) return "Edit Series";            
  if (pathname.startsWith("/series/assign-questions")) return "Assign Questions"; 


  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/main-category": "Main Categories",
    "/category-section": "Category Sections",
    "/sections": "Sections",
    "/topics": "Topics",
    "/sub-topics": "All Sub-Topics",
    "/sub-topics/new": "Add New Sub-Topic",
    "/books": "Manage Books",
    "/books/new": "Add New Book",
    "/ebooks": "Manage E-books",
    "/ebooks/new": "Add New E-book",
    "/courses": "Online Courses",
    "/courses/new": "Add New Course",
    "/course-classes": "Online Course Classes",
    "/course-classes/new": "Add New Class",
    "/online-course-pdfs": "Online Course PDFs",
    "/online-course-pdfs/new": "Add New PDF",
    "/in-app-notification": "In-App Notifications",         
    "/in-app-notification/new": "Create Notification",   
    "/sales/contact-enquiry": "Contact Us Enquiry",
    "/orders": "Order Management",
    "/users": "Manage Users",
    "/banners": "Manage Banners",
    "/banners/new": "Add New Banner",
    "/coupons": "Manage Coupons",    
    "/coupons/new": "Add New Coupon",
    "/subscriptions": "Manage Subscriptions",    
    "/subscriptions/new": "Add New Subscription", 
    "/seo-urls": "Manage SEO URLs",           
    "/seo-urls/new": "Add New SEO URL",   
    "/packages": "All Packages",                
    "/packages/new": "Add New Package", 
    "/practice-batch": "All Batches",             
    "/practice-batch/new": "Add New Batch",  
    "/instructions": "All Instruction",          
    "/instructions/new": "Add New Instruction", 
    "/duplicate-questions": "Duplicate Questions",
    "/questions": "All Questions",          
    "/questions/new": "Add New Question",
    "/series": "All Series",                 
    "/series/new": "Add New Series",               
  };
  return titles[pathname] || "Admin Dashboard";
}
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const [location] = useLocation();
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={getPageTitle(location)} />
        <main className="flex-1 overflow-auto px-4 py-6">{children}</main>
      </div>
    </div>
  );
};

function AppRouter() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" exact><Redirect to="/dashboard" /></Route>
        <Route path="/dashboard" component={Dashboard} />
        
        {/* Structure */}
        <Route path="/main-category" component={MainCategoryPage} />
        <Route path="/category-section" component={CategorySection} />
        <Route path="/sections" component={SectionPage} />
        <Route path="/topics" component={TopicPage} />
        <Route path="/sub-topics/new" component={NewSubTopicPage} />
        <Route path="/sub-topics/edit/:id" component={EditSubTopicPage} />
        <Route path="/sub-topics" component={SubTopicsPage} />

        {/* Study Material */}
        <Route path="/books/new" component={NewBookPage} />
        <Route path="/books/edit/:id" component={EditBookPage} />
        <Route path="/books" component={BooksPage} />
        <Route path="/ebooks/new" component={NewEbookPage} />
        <Route path="/ebooks/edit/:id" component={EditEbookPage} />
        <Route path="/ebooks" component={EbooksPage} />
        <Route path="/orders" component={OrderManagementPage} />

        {/* Learning */}
        <Route path="/courses/new" component={NewCoursePage} />
        <Route path="/courses/edit/:id" component={EditCoursePage} />
        <Route path="/courses/assign-class/:courseId" component={AssignClassPage} />
        <Route path="/courses/assign-pdf/:courseId" component={AssignPdfPage} />
        <Route path="/courses" component={CoursesPage} />
        <Route path="/course-classes/new" component={NewCourseClassPage} />
        <Route path="/course-classes/edit/:id" component={EditCourseClassPage} />
        <Route path="/course-classes" component={CourseClassesPage} />
        <Route path="/online-course-pdfs/new" component={NewCoursePdfPage} />
        <Route path="/online-course-pdfs/edit/:id" component={EditCoursePdfPage} />
        <Route path="/online-course-pdfs" component={CoursePdfsPage} />
        
        {/* Practice */}
        <Route path="/questions/new" component={NewQuestionPage} />    
        
        <Route path="/questions" component={AllQuestionsPage} />
        <Route path="/duplicate-questions" component={DuplicateQuestionPage} />
        <Route path="/instructions/new" component={NewInstructionPage} />
        <Route path="/instructions/edit/:id" component={EditInstructionPage} />
        <Route path="/instructions" component={InstructionsPage} />
        <Route path="/practice-batch/new" component={NewPracticeBatchPage} />
        
        <Route path="/practice-batch" component={PracticeBatchesPage} />
        <Route path="/packages/new" component={NewPackagePage} /> 
        {/* <Route path="/packages/edit/:id" component={EditPackagePage} />
        <Route path="/packages/assign-series/:id" component={AssignSeriesPage} />
        <Route path="/questions/edit/:id" component={EditQuestionPage} /> 
        <Route path="/practice-batch/edit/:id" component={EditPracticeBatchPage} />
        <Route path="/practice-batch/assign/:id" component={AssignToBatchPage} /> */}
        <Route path="/packages" component={PackagesPage} />

        {/* Marketing */}
        <Route path="/banners/new" component={AddBannerPage} />     
        <Route path="/banners/edit/:id" component={EditBannerPage} /> 
        <Route path="/banners" component={BannersPage} />
        <Route path="/seo-urls/new" component={NewSeoUrlPage} />
        <Route path="/seo-urls/edit/:id" component={EditSeoUrlPage} />
        <Route path="/seo-urls" component={SeoUrlsPage} />
        
        {/* Sales */}
        <Route path="/users" component={UsersPage} />  
        <Route path="/coupons/new" component={AddCouponPage} />
        <Route path="/coupons/edit/:id" component={EditCouponPage} />
        <Route path="/coupons" component={CouponsPage} />
        <Route path="/subscriptions/new" component={NewSubscriptionPage} />
        <Route path="/subscriptions/edit/:id" component={EditSubscriptionPage} />
        <Route path="/subscriptions" component={SubscriptionsPage} />
        <Route path="/sales/contact-enquiry" component={ContactUsEnquiryPage} />

        {/* Notifications */}
        <Route path="/in-app-notification/new" component={NewNotificationPage} />
        <Route path="/in-app-notification/edit/:id" component={EditNotificationPage} /> 
        <Route path="/in-app-notification" component={InAppNotificationPage} />

        {/* Series */}
        {/* <Route path="/series/new" component={NewSeriesPage} /> */}
        {/* <Route path="/series/edit/:id" component={EditSeriesPage} /> */}
        {/* <Route path="/series/assign-questions/:id" component={AssignQuestionsToSeriesPage} /> */}
        <Route path="/series" component={SeriesPage} />
        <Route path="/series/new" component={NewSeriesPage} />
        
        {/* 404 fallback */}
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster richColors position="top-right" />
        <AppRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
