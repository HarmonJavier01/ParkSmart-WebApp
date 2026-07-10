# 📱 ParkSmart: Step-by-Step Driver's User Guide

Welcome to the **ParkSmart Driver Guide**! This walkthrough guides you through the step-by-step process of accessing the application, finding a parking spot in Manaoag, reserving your slot, and preparing your QR ticket for entry.

---

## 🏁 User Flow at a Glance
1. **Login or Register** ➔ 2. **Browse Parking Lots** ➔ 3. **Select a Slot** ➔ 4. **Book Reservation** ➔ 5. **Screenshot QR Ticket** ➔ 6. **Arrive & Scan**

---

## 🔑 Step 1: Sign In or Create an Account

To book a parking spot, you must first access your personal portal.

1. Open the application in your browser and click **Login** in the top navigation bar, or navigate directly to `/account`.
2. **If you have an account**:
   - Under the **USERNAME** tab, enter your Email Address and Password.
   - Click the centered green right-arrow button (**→**) to log in.
3. **If you are a new user**:
   - Select the **REGISTER** tab.
   - Fill in your Full Name, Email, Phone Number, and Password.
   - Click the green right-arrow button (**→**) to register.
   - Check your email inbox for a **6-Digit OTP Verification Code**, enter it in the box, and click verify.

> [!NOTE]
> Checking the **"Stay Signed In"** box will preserve your login session so you do not have to sign in again the next time you open the application.

---

## 🔍 Step 2: Browse and Locate Parking Areas

Once signed in, find the best place to park.

1. Navigate to **Find Parking** via the navigation menu or dashboard sidebar.
2. An interactive list and map will show all active parking lots in Manaoag (e.g. *Manaoag Church Lot*, *Manaoag Public Market Lot*).
3. Each lot card displays:
   - **Real-time slots available** (e.g., "6 available").
   - **Rating** (out of 5.0 stars).
   - **Hourly rate** (in PHP).
   - **Occupancy Progress Bar** (visual representation of available space).
4. Click **View Details** on the lot card that suits you best.

---

## 🅿️ Step 3: Select Your Parking Spot

ParkSmart uses live IoT sensors to show you exactly which spots are free.

1. Inside the lot details page, you will see a visual grid layout of the parking lot slots.
2. Observe the color-coded slot cells:
   - 🟩 **Green (Available)**: Free to reserve immediately.
   - 🟥 **Red (Occupied)**: Spot is physically taken by another vehicle.
   - 🟨 **Yellow (Reserved)**: Spot is booked by another driver.
   - ⬛ **Gray (Disabled)**: Spot is temporarily out of service.
3. Click on any **Green (Available)** spot (e.g., Slot **A1**) to select it.

---

## 📅 Step 4: Book Your Slot

Set up your parking schedule and lock in your reservation.

1. After selecting a slot, you will be taken to the **Reservation Form**.
2. Confirm the selected spot details and check the hourly rate.
3. Select your **Start Time** (when you expect to arrive) and **Duration** (how many hours you need to park).
4. Review the calculated **Total Amount**.
5. Click **Confirm & Book Spot**.

---

## 📸 Step 5: Save Your QR Ticket (Screenshot Ready!)

Once confirmed, your secure ticket is generated. This is the screen you should prepare for entrance validation.

1. The app will automatically redirect you to your **Ticket Page** (`/ticket/:reservationId`).
2. This page displays:
   - **Ticket ID** and **Reservation Status** (Pending/Active).
   - **Parking Lot & Slot Name** (e.g. *Manaoag Church Lot - Slot A1*).
   - **Timing Schedule** (Start Time, End Time, and Duration).
   - **A big, clear QR Code** in the center of the ticket card.

> [!IMPORTANT]
> **Prepare the Screenshot**: 
> If you are on a smartphone, **take a screenshot of this Ticket screen** or save the QR code image. This allows you to easily retrieve it on arrival, even if you lose internet connection or mobile data in crowded areas.

---

## 🚗 Step 6: Arrive, Scan, and Park!

1. Drive to the parking facility at your scheduled **Start Time**.
2. Upon reaching the entrance gate, open your saved screenshot and present the **QR Code** to the parking operator.
3. The operator will scan your code (or click "Verify" on their operator dashboard) to activate your check-in.
4. Drive in and park directly in your designated spot (e.g. **A1**). The slot color on the screen will dynamically turn Red (Occupied) as soon as your vehicle blocks the sensor.
5. When your booking is complete, drive out. The sensor will automatically free the spot, resetting it to Green (Available) for the next driver.

---
*Thank you for choosing ParkSmart! Drive safely.*
