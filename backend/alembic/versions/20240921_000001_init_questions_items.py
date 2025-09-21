"""init questions and knowledge_items

Revision ID: 20240921_000001
Revises: 
Create Date: 2025-09-21 00:00:01

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20240921_000001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
    op.create_table(
        'questions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('difficulty', sa.String(length=10), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    op.create_table(
        'knowledge_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('question_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('questions.id'), nullable=False),
        sa.Column('flashcard', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('mindmap', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('code', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('project_usage', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    )
    op.create_index('ix_knowledge_items_question_id', 'knowledge_items', ['question_id'])


def downgrade() -> None:
    op.drop_index('ix_knowledge_items_question_id', table_name='knowledge_items')
    op.drop_table('knowledge_items')
    op.drop_table('questions')

