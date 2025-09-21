"""add problems table

Revision ID: 20240921_000002
Revises: 20240921_000001
Create Date: 2025-09-21 00:20:00

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20240921_000002'
down_revision = '20240921_000001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'problems',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('difficulty', sa.String(length=10), nullable=True),
        sa.Column('solution_code', sa.Text(), nullable=False),
        sa.Column('solution_language', sa.String(length=20), nullable=False),
        sa.Column('test_cases', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('problems')

