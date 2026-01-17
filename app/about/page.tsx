"use client";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-linear-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600">
            Learn more about our mission and values
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We are dedicated to delivering exceptional solutions that empower
            businesses and individuals to achieve their goals.
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Innovation",
                description: "Pioneering new solutions and ideas",
              },
              {
                title: "Quality",
                description: "Delivering excellence in everything we do",
              },
              {
                title: "Integrity",
                description: "Building trust through honest practices",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-700 leading-relaxed">
            Our talented team is committed to bringing your vision to life with
            creativity, expertise, and dedication.
          </p>
        </section>
      </div>
    </main>
  );
}
