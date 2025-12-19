from db import Base, engine
import time
import sys

def init_db():
    print("Waiting for database to be ready...")
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Try to connect to the database
            connection = engine.connect()
            connection.close()
            print("Database connection successful!")
            break
        except Exception as e:
            retry_count += 1
            print(f"Database not ready yet (attempt {retry_count}/{max_retries}): {e}")
            if retry_count >= max_retries:
                print("Failed to connect to database after maximum retries.")
                sys.exit(1)
            time.sleep(2)
    
    print("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_db()
