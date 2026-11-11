/**
 * One combat rule (combat/rules.ts, rules 508.1c, 508.1d, 509.1b, 509.1c): the
 * records aimed at a defender or an attacker, their durations, and the pool
 * walk that holds every definition to the one vocabulary.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { POOL_CARDS } from "../cards.js";
import { whyCannotAttack, whyCannotBlock } from "../combat/eligibility.js";
import { recordsOn } from "../combat/rules.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import type { GameState } from "../state.js";
import { aimedAt } from "./combat-probe.js";
import { A, B, C, attack, destroy, grant, pickTargets, ref, spawn, table } from "./harness.js";

type AttackOffer = Extract<LegalAction, { kind: "declare-attackers" }>;

function toPriority(game: Game, turnOf: PlayerId, step: GameState["turn"]["step"], who: PlayerId): void {
  game.advanceUntil(
    (s) =>
      activePlayerOf(s) === turnOf &&
      s.turn.step === step &&
      s.priority.holder === who &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0,
  );
}

function attackOffer(game: Game, player: PlayerId): AttackOffer {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === player);
  const offer = game.legalActions(player).find((o): o is AttackOffer => o.kind === "declare-attackers");
  if (offer === undefined) throw new Error(`${player} wasn't asked to attack`);
  return offer;
}

function setLife(game: Game, player: PlayerId, life: number): void {
  game.state.players[player].life = life;
}

describe("a requirement aimed at a set is one requirement (rule 508.1d)", () => {
  it("Galactus attacks the opponent with the most life", () => {
    const { game } = table({ players: 3 });
    const galactus = spawn(game, "Galactus, Devourer of Worlds");
    setLife(game, B, 30);
    setLife(game, C, 20);
    const offer = attackOffer(game, A);
    expect(offer.mustAttack).toEqual([galactus]);
    expect(offer.defendersFor[galactus]).toEqual([B]);
  });

  it("two tied opponents are one requirement, obeyed by attacking either", () => {
    const { game } = table({ players: 3 });
    const galactus = spawn(game, "Galactus, Devourer of Worlds");
    setLife(game, B, 30);
    setLife(game, C, 30);
    const offer = attackOffer(game, A);
    expect(offer.mustAttack).toEqual([galactus]);
    expect([...offer.defendersFor[galactus]].sort()).toEqual([B, C].sort());
  });

  it("not a planeswalker of the opponent with the most life", () => {
    const { game } = table({ players: 3 });
    const galactus = spawn(game, "Galactus, Devourer of Worlds");
    const jace = spawn(game, "Jace Beleren", B);
    setLife(game, B, 30);
    setLife(game, C, 20);
    const offer = attackOffer(game, A);
    expect(offer.defendersFor[galactus]).toEqual([B]);
    expect(offer.defendersFor[galactus]).not.toContain(jace);
  });

  it("nobody it could obey it by, it asks nothing", () => {
    const { game } = table({ players: 3 });
    const galactus = spawn(game, "Galactus, Devourer of Worlds");
    setLife(game, B, 30);
    setLife(game, C, 20);
    // Bob's Vow-like rule: Galactus can't attack the player with the most life.
    game.state.objects[galactus].modifiers.push({
      power: 0,
      toughness: 0,
      keywords: [],
      untilEndOfTurn: false,
      restrictions: [{ kind: "cant-attack", at: { player: B }, you: B }],
    });
    const offer = attackOffer(game, A);
    expect(offer.mustAttack).toEqual([]);
    expect(offer.defendersFor[galactus]).toEqual([C]);
  });

  it("doesn't apply while you control Silver Surfer", () => {
    const { game } = table({ players: 3 });
    const galactus = spawn(game, "Galactus, Devourer of Worlds");
    spawn(game, "Silver Surfer, Galactus's Herald");
    setLife(game, B, 30);
    const offer = attackOffer(game, A);
    expect(offer.mustAttack).toEqual([]);
    expect([...offer.defendersFor[galactus]].sort()).toEqual([B, C].sort());
  });
});

describe("Silver Surfer, Galactus's Herald: a rule on one creature for a long time", () => {
  it("attacks that player each combat if able, until the end of your next turn", () => {
    const { game, a } = table({ players: 3 });
    const surfer = spawn(game, "Silver Surfer, Galactus's Herald");
    const bears = spawn(game, "Grizzly Bears", C);
    pickTargets(a, bears);
    attack(game, a, [surfer]);
    a.declareAttackersFn = () => [];
    expect(aimedAt(game, bears)).toBe(B);
    // Carol's own turn: she must send it at Bob.
    const offer = attackOffer(game, C);
    expect(offer.mustAttack).toEqual([bears]);
    expect(offer.defendersFor[bears]).toEqual([B]);
    // Through the end of Alice's next turn, then gone.
    game.advanceUntil((s) => activePlayerOf(s) === A && s.turn.step === "precombat-main");
    expect(aimedAt(game, bears)).toBe(B);
    game.advanceUntil((s) => activePlayerOf(s) === B);
    expect(aimedAt(game, bears)).toBeUndefined();
  });

  it("the requirement is the object it was (rule 400.7)", () => {
    const { game, a } = table({ players: 3 });
    const surfer = spawn(game, "Silver Surfer, Galactus's Herald");
    const bears = spawn(game, "Grizzly Bears", C);
    pickTargets(a, bears);
    attack(game, a, [surfer]);
    expect(aimedAt(game, bears)).toBe(B);
    destroy(game, bears, A);
    expect(game.state.objects[bears].modifiers).toEqual([]);
  });
});

describe("Public Enemy: a static aimed at the enchanted creature's controller", () => {
  it("every creature attacks that player if able, and its own controller's are free", () => {
    const { game } = table({ players: 3 });
    const enchanted = spawn(game, "Grizzly Bears", C);
    const enemy = spawn(game, "Public Enemy");
    game.state.objects[enemy].attachedTo = enchanted;
    const bears = spawn(game, "Grizzly Bears");
    const carols = spawn(game, "Grizzly Bears", C);
    const offer = attackOffer(game, A);
    expect(offer.mustAttack).toEqual([bears]);
    expect(offer.defendersFor[bears]).toEqual([C]);
    // Carol can't attack herself: there's nobody to obey it by.
    expect(recordsOn(game.state, game.registry, carols)).toHaveLength(1);
  });
});

describe("the block side", () => {
  it("can block creatures with shadow as though it had shadow, and still anything else", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Heartwood Dryad", B);
    const wall = spawn(game, "Wall of Diffusion", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const shade = spawn(game, "Grizzly Bears");
    grant(game, shade, "shadow");
    const plain = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: shade, defender: B },
      { attacker: plain, defender: B },
    ];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    expect(whyCannotBlock(game.state, game.registry, B, dryad, shade)).toBeNull();
    expect(whyCannotBlock(game.state, game.registry, B, wall, shade)).toBeNull();
    expect(whyCannotBlock(game.state, game.registry, B, dryad, plain)).toBeNull();
    // Without the permission, nothing changes (rule 702.28b).
    expect(whyCannotBlock(game.state, game.registry, B, bears, shade)).toMatch(/shadow/);
  });

  it("Aether Web gives the permission to the creature it enchants", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const web = spawn(game, "Aether Web", B);
    game.state.objects[web].attachedTo = bears;
    const shade = spawn(game, "Grizzly Bears");
    grant(game, shade, "shadow");
    a.declareAttackersFn = () => [{ attacker: shade, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    expect(whyCannotBlock(game.state, game.registry, B, bears, shade)).toBeNull();
  });

  it("can't be blocked except by Spirits, on the creature and as a rule for the turn", () => {
    const { game, a } = table();
    const deckhand = spawn(game, "Departed Deckhand");
    const bears = spawn(game, "Grizzly Bears", B);
    const spirit = spawn(game, "Departed Deckhand", B);
    a.declareAttackersFn = () => [{ attacker: deckhand, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    expect(whyCannotBlock(game.state, game.registry, B, bears, deckhand)).not.toBeNull();
    expect(whyCannotBlock(game.state, game.registry, B, spirit, deckhand)).toBeNull();
  });

  it("Forgestoker's can't block lasts this combat", () => {
    const { game } = table();
    const dragon = spawn(game, "Forgestoker Dragon");
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "restrict", target: 0, restrictions: ["cant-block"], duration: "until-end-of-combat" }, [ref(bears)]);
    expect(whyCannotBlock).toBeDefined();
    expect(game.state.objects[bears].modifiers[0].untilEndOfCombat).toBe(true);
    game.advanceUntil((s) => s.turn.step === "postcombat-main");
    expect(game.state.objects[bears].modifiers).toEqual([]);
    expect(dragon).toBeDefined();
  });
});

describe("Wall of Vapor: the creatures it's blocking", () => {
  it("prevents damage from what it blocks, and only that", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Wall of Vapor", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: wall, attacker: bears }];
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "end-combat");
    expect(game.state.objects[wall].zone).toBe("battlefield");
    expect(game.state.objects[wall].damageMarked).toBe(0);
  });
});

describe("a token put onto the battlefield blocking (rule 509.4)", () => {
  it("Brimaz's token blocks that creature, and the attacker takes it as a blocker", () => {
    const { game, a, b } = table();
    const brimaz = spawn(game, "Brimaz, King of Oreskos", B);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: brimaz, attacker: bears }];
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "combat-damage");
    const blockers = game.state.objects[bears].blockedBy;
    expect(blockers).toHaveLength(2);
    expect(blockers).toContain(brimaz);
    const token = blockers.find((id) => id !== brimaz) as ObjectId;
    expect(game.state.objects[token].blocking).toBe(bears);
  });

  it("isn't blocking if it isn't attacking that token's controller (509.4a)", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].attacking = C;
    const token = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "enter-blocking", blocker: 0, attacker: 1 }, [ref(token), ref(bears)]);
    expect(game.state.objects[token].blocking).toBeNull();
    expect(game.state.objects[bears].blockedBy).toEqual([]);
  });

  it("Flash Foliage: the attacker becomes blocked, and nothing says the token blocked", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null);
    expect(game.state.objects[bears].blocked).toBe(false);
    game.debugApplyEffect(
      B,
      {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Saproling Token", count: 1, separate: true },
          { kind: "enter-blocking", blocker: "created", attacker: 0 },
        ],
      },
      [ref(bears)],
    );
    expect(game.state.objects[bears].blocked).toBe(true);
    expect(game.state.objects[bears].blockedBy).toHaveLength(1);
  });
});

describe("the attack side's restrictions", () => {
  it("a rule over the game reaches a creature that arrives later (rule 611.2c)", () => {
    const { game } = table({ players: 3 });
    game.debugApplyEffect(
      A,
      { kind: "restrict", filter: { type: "creature" }, restrictions: [{ kind: "cant-attack", at: "you" }], duration: "until-your-next-turn" },
      [],
    );
    const late = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "declare-attackers", B);
    expect(whyCannotAttack(game.state, game.registry, B, late, A)).toMatch(/can't attack/);
    expect(whyCannotAttack(game.state, game.registry, B, late, C)).toBeNull();
  });

  it("names only that player: a planeswalker of theirs is still attackable (rule 508.1b)", () => {
    const { game } = table({ players: 3 });
    const jace = spawn(game, "Jace Beleren");
    game.debugApplyEffect(
      A,
      { kind: "restrict", filter: { type: "creature" }, restrictions: [{ kind: "cant-attack", at: "you" }], duration: "until-your-next-turn" },
      [],
    );
    const bears = spawn(game, "Grizzly Bears", B);
    toPriority(game, B, "declare-attackers", B);
    expect(whyCannotAttack(game.state, game.registry, B, bears, jace)).toBeNull();
  });

  it("during a target player's next turn only, whatever they control then", () => {
    const { game } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(
      A,
      {
        kind: "restrict",
        filter: { type: "creature", controlledBy: "you" },
        controlledByTarget: 0,
        restrictions: ["must-attack"],
        duration: { duringTurnOf: { target: 0 } },
      },
      [ref(B)],
    );
    expect(attackOffer(game, B).mustAttack).toEqual([bears]);
  });
});

/** Every `restrictions` array and `restrict` effect in a definition. */
function* walk(value: unknown): Generator<Record<string, unknown>> {
  if (Array.isArray(value)) {
    for (const item of value) yield* walk(item);
    return;
  }
  if (value === null || typeof value !== "object") return;
  const object = value as Record<string, unknown>;
  yield object;
  for (const v of Object.values(object)) if (typeof v === "object") yield* walk(v);
}

describe("every definition speaks the one vocabulary", () => {
  const STATIC_REMOVED = [
    "cantAttackController",
    "cantAttackUnlessDefender",
    "cantAttackIfDefender",
    "cantBlockUnlessAttacker",
    "canBlockOnly",
    "blockedByAtMostOne",
    "blockedByAtLeast",
    "blockedOnlyByAll",
    "mustBeBlockedBy",
    "attacksIfAttacks",
  ];
  const RESTRICT_REMOVED = ["cantBeBlockedBy", "cantBlockAttacker", "cantAttackYou", "cantBlockYours"];
  const KINDS = new Set([
    "cant-attack",
    "must-attack",
    "cant-block",
    "must-block",
    "cant-be-blocked",
    "must-be-blocked",
    "must-be-blocked-if-able",
    "attack-only-nearest",
  ]);
  const WORDS = new Set([
    "cant-attack",
    "cant-block",
    "cant-be-attacked",
    "cant-be-blocked",
    "must-attack",
    "must-block",
    "must-be-blocked",
    "must-be-blocked-if-able",
    "cant-attack-alone",
    "cant-block-alone",
    "can-only-attack-alone",
    "cant-attack-unless-two-others",
    "cant-block-unless-two-others",
    "doesnt-untap",
    "cant-turn-face-up",
    "cant-crew",
  ]);
  const FIELDS: Record<string, readonly string[]> = {
    "cant-attack": ["at", "unlessDefender", "ifDefender"],
    "must-attack": ["at", "otherThan", "ifAttacks"],
    "cant-block": ["attacker", "attackers", "unlessAttacking"],
    "must-block": ["attacker"],
    "cant-be-blocked": ["by", "byMoreThan", "byFewerThan", "unlessAllBlock"],
    "must-be-blocked": ["by"],
    "must-be-blocked-if-able": ["by", "exactlyOne"],
    // `from` is the permanent that chose, set as the rule is bound.
    "attack-only-nearest": ["direction"],
  };
  const PLAYER_DURATIONS = new Set([
    "end-of-turn",
    "until-end-of-combat",
    "permanent",
    "until-your-next-turn",
    "until-end-of-your-next-turn",
    "during-your-next-turn",
    "until-your-next-upkeep",
    "until-end-of-your-next-upkeep",
  ]);
  const STATIC_AIMS = new Set(["you", "you-and-planeswalkers", "you-and-permanents", "owner", "owner-planeswalkers", "attacked-this-turn", "source"]);

  it("the removed fields and effects are gone, and every rule is well formed", () => {
    const bad: string[] = [];
    let rulesRead = 0;
    for (const card of POOL_CARDS) {
      for (const o of walk(card)) {
        if (o.kind === "block-if-able" || o.kind === "attack-requirement") bad.push(`${card.name}: ${String(o.kind)}`);
        if (o.affects !== undefined) {
          for (const f of STATIC_REMOVED) if (f in o) bad.push(`${card.name}: static ${f}`);
          if ("cantBeBlockedBy" in o) bad.push(`${card.name}: static cantBeBlockedBy`);
        }
        if (o.kind === "restrict") {
          for (const f of RESTRICT_REMOVED) if (f in o) bad.push(`${card.name}: restrict ${f}`);
          const filterForm = o.filter !== undefined && o.asItResolves !== true;
          const d = o.duration;
          if (filterForm && typeof d === "string" && !PLAYER_DURATIONS.has(d)) bad.push(`${card.name}: filter restrict lasts ${d}`);
          if (filterForm && typeof d === "object" && d !== null && !("duringTurnOf" in d || "untilTurnOf" in d || "throughTurnOf" in d)) {
            bad.push(`${card.name}: filter restrict lasts ${JSON.stringify(d)}`);
          }
        }
        if (!("restrictions" in o) || !Array.isArray(o.restrictions)) continue;
        for (const rule of o.restrictions as unknown[]) {
          rulesRead += 1;
          if (typeof rule === "string") {
            if (!WORDS.has(rule)) bad.push(`${card.name}: word ${rule}`);
            continue;
          }
          if (rule === null || typeof rule !== "object") {
            bad.push(`${card.name}: rule ${String(rule)}`);
            continue;
          }
          const record = rule as Record<string, unknown>;
          const kind = String(record.kind);
          if (!KINDS.has(kind)) {
            bad.push(`${card.name}: kind ${kind}`);
            continue;
          }
          const fields = Object.keys(record).filter((f) => f !== "kind");
          // A record that says no more than its kind is the word, the only spelling.
          if (fields.length === 0 && kind !== "must-be-blocked") bad.push(`${card.name}: bare record ${kind}`);
          for (const f of fields) if (!FIELDS[kind].includes(f)) bad.push(`${card.name}: ${kind} field ${f}`);
          // A direction for every player is read only off a rule over the
          // game (`nearestOpponentRule`): a `restrict` with a `filter`, never
          // a static's, a target's or a fixed set's, and always saying which.
          if (kind === "attack-only-nearest") {
            if (o.kind !== "restrict" || o.filter === undefined || o.asItResolves === true) {
              bad.push(`${card.name}: attack-only-nearest outside a restrict over the game`);
            }
            if (record.direction !== "left" && record.direction !== "right") {
              bad.push(`${card.name}: attack-only-nearest direction ${String(record.direction)}`);
            }
          }
          // Bound forms exist only once an effect resolved.
          if ("you" in record) bad.push(`${card.name}: authored "you"`);
          const at = record.at;
          if (typeof at === "object" && at !== null && ("player" in at || ("object" in at && "stint" in at))) {
            bad.push(`${card.name}: bound aim`);
          }
          // A static's aim is read with no resolution behind it.
          if (o.affects !== undefined && at !== undefined) {
            const reads =
              (typeof at === "string" && STATIC_AIMS.has(at)) ||
              (typeof at === "object" && at !== null && ("defender" in at || "planeswalkers" in at || ("controllerOf" in at && (at as { controllerOf: unknown }).controllerOf === "attached")));
            if (!reads) bad.push(`${card.name}: static aims ${JSON.stringify(at)}`);
          }
        }
      }
    }
    // The walk really reached the pool's rules (a broken walker would pass).
    expect(rulesRead).toBeGreaterThan(1000);
    expect(bad).toEqual([]);
  });
});
