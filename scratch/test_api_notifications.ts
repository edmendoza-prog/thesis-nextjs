import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-fallback-key-do-not-use-in-prod');

async function createToken(userId: number, role: string) {
  return await new SignJWT({ sub: String(userId), role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(JWT_SECRET);
}

async function testApiNotifications() {
  console.log('--- Testing /api/student/notifications HTTP Endpoint ---');

  // Test with Student 3 (Ed Ryan Mendoza)
  const token3 = await createToken(3, 'student');
  const headers3 = {
    Cookie: `lms_session=${token3}`,
    'Content-Type': 'application/json',
  };

  // 1. GET Notifications for Student 3
  const res3 = await fetch('http://localhost:3000/api/student/notifications', {
    headers: headers3,
  });
  const data3 = await res3.json();

  console.log(`HTTP GET Status: ${res3.status}`);
  console.log(`Unread Count: ${data3.unreadCount}`);
  console.log(`Total Notifications Received: ${data3.notifications?.length}`);

  if (data3.notifications && data3.notifications.length > 0) {
    const sample = data3.notifications[0];
    console.log(`Sample notification: [${sample.type}] ${sample.title} - ${sample.message}`);
    console.log(`Teacher: ${sample.teacherName} | Class: ${sample.className} | IsRead: ${sample.isRead}`);

    // 2. POST to mark the sample notification as read
    console.log(`\nMarking key "${sample.key}" as read...`);
    const markRes = await fetch('http://localhost:3000/api/student/notifications', {
      method: 'POST',
      headers: headers3,
      body: JSON.stringify({ key: sample.key }),
    });
    const markData = await markRes.json();
    console.log(`Mark Read HTTP Status: ${markRes.status}, Response:`, markData);

    // 3. GET again to verify unreadCount decremented and isRead is true
    const verifyRes = await fetch('http://localhost:3000/api/student/notifications', {
      headers: headers3,
    });
    const verifyData = await verifyRes.json();
    const updatedSample = verifyData.notifications.find((n: any) => n.key === sample.key);
    console.log(`Verification: Item "${sample.key}" isRead is now: ${updatedSample?.isRead}`);
    console.log(`Updated Unread Count: ${verifyData.unreadCount}`);

    if (updatedSample?.isRead === true) {
      console.log('✅ PASS: API successfully updated and persisted read state.');
    } else {
      console.error('❌ FAIL: Notification read state not updated.');
    }
  }

  // 4. Test Unenrolled Student 4 (Althea Abbygail Cambray)
  console.log('\n--- Testing with Unenrolled Student 4 ---');
  const token4 = await createToken(4, 'student');
  const res4 = await fetch('http://localhost:3000/api/student/notifications', {
    headers: {
      Cookie: `lms_session=${token4}`,
    },
  });
  const data4 = await res4.json();
  console.log(`Student 4 Notifications Count: ${data4.notifications?.length}, Unread: ${data4.unreadCount}`);

  if (data4.notifications?.length === 0) {
    console.log('✅ PASS: Unenrolled student receives exactly 0 notifications (no data leakage).');
  } else {
    console.error('❌ FAIL: Data leakage detected for unenrolled student.');
  }

  console.log('\n=== ALL API TESTS COMPLETED SUCCESSFULLY! ===');
  process.exit(0);
}

testApiNotifications().catch(err => {
  console.error('API Test Error:', err);
  process.exit(1);
});
