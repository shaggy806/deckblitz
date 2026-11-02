/**
 * A number of yours against another player's, as a condition and as a count
 * (`player-compare`, `countPlayers`' `where`): an intervening-if (rule 603.4),
 * a `conditional` read after what comes before it (rule 608.2c), a target slot's
 * player, and a planeswalker's controller. Linvala, the Preserver; Glorious
 * Enforcer; Pulse of the Forge; Pulse of the Dross; Wojek Investigator.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, D, cast, enter, hand, keywords, lands, life, nextTurn, pickFromZone, ref, settle, spawn, table, toHand, toStep, tokensNamed, zone } from "./harness.js";

const setLife = (game: Game, player: PlayerId, to: number): void => {
  game.state.players[player].life = to;
};

/** Every hand emptied: a hand is then just the cards a test puts in it. */
const emptyHands = (game: Game): void => {
  for (const player of game.state.turnOrder) {
    for (const id of [...hand(game, player)]) game.debugMove(id, "library");
  }
};

describe("Linvala, the Preserver: a comparison as an intervening-if", () => {
  it("an opponent with more life: you gain 5", () => {
    const { game } = table();
    setLife(game, A, 10);
    enter(game, "Linvala, the Preserver");
    expect(life(game)).toBe(15);
  });

  it("no opponent with more life, a tie included: nothing", () => {
    const { game } = table();
    enter(game, "Linvala, the Preserver");
    expect(life(game)).toBe(20);
    expect(tokensNamed(game, "3/3 White Angel Token")).toBe(0);
  });

  it("one opponent ahead of you is enough, and the creatures are a trigger of their own", () => {
    const { game } = table({ players: 3 });
    setLife(game, A, 15);
    setLife(game, B, 5);
    setLife(game, C, 16);
    spawn(game, "Hill Giant", C);
    spawn(game, "Hill Giant", C);
    enter(game, "Linvala, the Preserver");
    expect(life(game)).toBe(20);
    expect(tokensNamed(game, "3/3 White Angel Token")).toBe(1);
  });

  it("is asked again as it resolves (rule 603.4): no longer behind, no life", () => {
    const { game } = table();
    setLife(game, A, 10);
    lands(game, "Plains", 6);
    const linvala = toHand(game, "Linvala, the Preserver");
    cast(game, linvala, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && zone(game, linvala) === "battlefield");
    setLife(game, B, 4);
    settle(game);
    expect(life(game)).toBe(10);
  });
});

describe("Glorious Enforcer: more life than an opponent", () => {
  it("gains double strike at the beginning of each combat while you're ahead of an opponent", () => {
    const { game } = table();
    const enforcer = spawn(game, "Glorious Enforcer");
    setLife(game, B, 19);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, enforcer).has("double-strike")).toBe(true);
  });

  it("doesn't on a tie, and it's each combat: an opponent's too", () => {
    const { game } = table();
    const enforcer = spawn(game, "Glorious Enforcer");
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, enforcer).has("double-strike")).toBe(false);
    nextTurn(game);
    setLife(game, B, 3);
    game.advanceUntil((s) => s.turn.step === "declare-attackers");
    expect(keywords(game, enforcer).has("double-strike")).toBe(true);
  });
});

describe("Pulse of the Forge: that player or that planeswalker's controller", () => {
  it("returns to hand if the player damaged still has more life than you", () => {
    const { game } = table();
    setLife(game, A, 5);
    lands(game, "Mountain", 3);
    const pulse = toHand(game, "Pulse of the Forge");
    cast(game, pulse, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, pulse)).toBe("hand");
  });

  it("is read after the damage (rule 608.2c): 4 damage that levels you leaves it in the graveyard", () => {
    const { game } = table();
    setLife(game, A, 16);
    lands(game, "Mountain", 3);
    const pulse = toHand(game, "Pulse of the Forge");
    cast(game, pulse, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(zone(game, pulse)).toBe("graveyard");
  });

  it("at a planeswalker, it's that planeswalker's controller's life", () => {
    const { game } = table();
    setLife(game, A, 5);
    lands(game, "Mountain", 3);
    const walker = spawn(game, "Jace Beleren", B);
    game.state.objects[walker].counters.loyalty = 9;
    const pulse = toHand(game, "Pulse of the Forge");
    cast(game, pulse, { targets: [ref(walker)] });
    expect(game.state.objects[walker].counters.loyalty).toBe(5);
    expect(life(game, B)).toBe(20);
    expect(zone(game, pulse)).toBe("hand");
  });

  it("aimed at yourself, you never have more life than you", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const pulse = toHand(game, "Pulse of the Forge");
    cast(game, pulse, { targets: [ref(A)] });
    expect(life(game)).toBe(16);
    expect(zone(game, pulse)).toBe("graveyard");
  });
});

describe("Pulse of the Dross: a target player's hand against yours", () => {
  it("returns to hand if that player still has more cards in hand, read after the discard", () => {
    const { game, a } = table();
    emptyHands(game);
    lands(game, "Swamp", 3);
    const pulse = toHand(game, "Pulse of the Dross");
    toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", B);
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a, giant);
    cast(game, pulse, { targets: [ref(B)] });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(hand(game, B).length).toBe(2);
    expect(zone(game, pulse)).toBe("hand");
  });

  it("stays in the graveyard when the discard leaves them level with you", () => {
    const { game, a } = table();
    emptyHands(game);
    lands(game, "Swamp", 3);
    toHand(game, "Grizzly Bears");
    const pulse = toHand(game, "Pulse of the Dross");
    const giant = toHand(game, "Hill Giant", B);
    toHand(game, "Grizzly Bears", B);
    pickFromZone(a, giant);
    cast(game, pulse, { targets: [ref(B)] });
    settle(game);
    expect(hand(game, B).length).toBe(1);
    expect(hand(game).length).toBe(1);
    expect(zone(game, pulse)).toBe("graveyard");
  });
});

describe("Wojek Investigator: a count of the opponents ahead of you", () => {
  it("investigates once for each opponent with more cards in hand than you, not for each card", () => {
    const { game } = table({ players: 4 });
    emptyHands(game);
    spawn(game, "Wojek Investigator");
    // The draw steps of the next three turns add one to each opponent's hand,
    // and Alice's own upkeep comes before her draw.
    for (let i = 0; i < 2; i += 1) toHand(game, "Grizzly Bears");
    for (let i = 0; i < 4; i += 1) toHand(game, "Grizzly Bears", B);
    toHand(game, "Grizzly Bears", C); // One, and the draw: level with Alice.
    for (let i = 0; i < 2; i += 1) toHand(game, "Grizzly Bears", D);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.turn.step).toBe("precombat-main");
    const before = tokensNamed(game, "Clue Token", A);
    expect(before).toBe(0);
    game.advanceUntil((s) => s.turn.step === "draw" && s.turn.number === 5);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
  });
});
