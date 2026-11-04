/**
 * Conditions on how one player's state compares with another's, composed from
 * `of-player` and `player-compare`: the Backgrounds' "no opponent has more life
 * than that player", "that player controls more lands than you" (the player a
 * land entered under), "more creatures than that spell's controller", "more
 * creatures of that type than each other player", and "its controller controls
 * no other creatures" of an enchanted or a targeted creature.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, counters, controller, keywords, lands, pickFromZone, pickTargets, pt, settle, spawn, table, toHand, tokensNamed, zone, enter } from "./harness.js";
import type { Table } from "./harness.js";

const setLife = (t: Table, who: PlayerId, life: number): void => {
  t.game.state.players[who].life = life;
};
const commander = (t: Table, name: string, player: PlayerId = A): ObjectId => {
  const id = spawn(t.game, name, player, { sick: false });
  t.game.state.objects[id].isCommander = true;
  return id;
};
const declare = (t: Table, attacker: ObjectId, defender: PlayerId | ObjectId): void => {
  t.a.declareAttackersFn = () => [{ attacker, defender }];
  t.game.advanceUntil((s) => s.turn.step === "declare-blockers");
};

describe("no opponent has more life than that player (Guild Artisan)", () => {
  it("fires against the opponent with the most life", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const cmd = commander(t, "Grizzly Bears");
    setLife(t, C, 25);
    declare(t, cmd, C);
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(2);
  });

  it("doesn't fire against an opponent with less than another opponent", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const cmd = commander(t, "Grizzly Bears");
    setLife(t, C, 25);
    declare(t, cmd, B);
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(0);
  });

  it("fires on a tie", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const cmd = commander(t, "Grizzly Bears");
    declare(t, cmd, B);
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(2);
  });

  it("leaves the attacker's own life out, unlike dethrone (the ruling)", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const cmd = commander(t, "Grizzly Bears");
    setLife(t, A, 90);
    setLife(t, C, 10);
    declare(t, cmd, B);
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(2);
  });

  it("ignores an opponent who has left the game", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const cmd = commander(t, "Grizzly Bears");
    t.game.state.players[C].life = 50;
    t.game.state.players[C].hasLost = true;
    declare(t, cmd, B);
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(2);
  });

  it("doesn't fire on a planeswalker (rule 508.3a)", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const cmd = commander(t, "Grizzly Bears");
    declare(t, cmd, spawn(t.game, "Jace Beleren", B));
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(0);
  });

  it("is asked again as it resolves (rule 603.4)", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const cmd = commander(t, "Grizzly Bears");
    t.a.declareAttackersFn = () => [{ attacker: cmd, defender: B }];
    t.game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length > 0);
    setLife(t, C, 25);
    t.game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(0);
  });

  it("is only on a commander you own", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Guild Artisan");
    const bears = spawn(t.game, "Grizzly Bears", A, { sick: false });
    declare(t, bears, B);
    expect(tokensNamed(t.game, "Treasure Token", A)).toBe(0);
  });
});

describe("the same grant's other effects", () => {
  it("Agent of the Shadow Thieves: a counter, then deathtouch and indestructible", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Agent of the Shadow Thieves");
    const cmd = commander(t, "Grizzly Bears");
    declare(t, cmd, B);
    expect(counters(t.game, cmd)).toBe(1);
    expect(keywords(t.game, cmd).has("deathtouch")).toBe(true);
    expect(keywords(t.game, cmd).has("indestructible")).toBe(true);
  });

  it("Sword Coast Sailor: can't be blocked this turn", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Sword Coast Sailor");
    const cmd = commander(t, "Grizzly Bears");
    declare(t, cmd, B);
    expect(keywords(t.game, cmd).has("unblockable")).toBe(true);
  });
});

describe("that player controls more lands than you (Archaeomancer's Map)", () => {
  const board = (t: Table): { landInHand: ObjectId } => {
    spawn(t.game, "Archaeomancer's Map");
    lands(t.game, "Wastes", 2, A);
    lands(t.game, "Wastes", 2, B);
    return { landInHand: toHand(t.game, "Plains") };
  };

  it("offers the land when the land's controller now has more", () => {
    const t = table({ players: 3 });
    const { landInHand } = board(t);
    pickFromZone(t.a, landInHand);
    enter(t.game, "Wastes", B);
    expect(zone(t.game, landInHand)).toBe("battlefield");
  });

  it("asks about that player, not any opponent", () => {
    const t = table({ players: 3 });
    const { landInHand } = board(t);
    lands(t.game, "Wastes", 4, C); // Carol has plenty; it's her who'd need a land to enter.
    pickFromZone(t.a, landInHand);
    enter(t.game, "Wastes", B); // Bob goes to 3 against Alice's 2: still fires.
    expect(zone(t.game, landInHand)).toBe("battlefield");
  });

  it("doesn't fire when that player still has no more than you, whatever another has", () => {
    const t = table({ players: 3 });
    const { landInHand } = board(t);
    lands(t.game, "Wastes", 1, A);
    lands(t.game, "Wastes", 4, C);
    const offered = pickFromZone(t.a, landInHand);
    enter(t.game, "Wastes", B); // Bob 3, Alice 3.
    expect(offered.offered).toEqual([]);
    expect(zone(t.game, landInHand)).toBe("hand");
  });

  it("doesn't fire on your own land", () => {
    const t = table({ players: 2 });
    const { landInHand } = board(t);
    lands(t.game, "Wastes", 4, B);
    const offered = pickFromZone(t.a, landInHand);
    enter(t.game, "Wastes", A);
    expect(offered.offered).toEqual([]);
    expect(zone(t.game, landInHand)).toBe("hand");
  });

  it("is checked again as it resolves (the ruling)", () => {
    const t = table({ players: 2 });
    const { landInHand } = board(t);
    const offered = pickFromZone(t.a, landInHand);
    enter(t.game, "Wastes", B, { settle: false });
    lands(t.game, "Wastes", 1, A);
    settle(t.game);
    expect(offered.offered).toEqual([]);
    expect(zone(t.game, landInHand)).toBe("hand");
  });
});

describe("more creatures than that spell's controller (Unified Will)", () => {
  /** Alice casts Grizzly Bears; Bob answers with Unified Will. Where the Bears ended up. */
  const answered = (t: Table): string => {
    lands(t.game, "Forest", 2, A);
    lands(t.game, "Island", 2, B);
    const spell = toHand(t.game, "Grizzly Bears", A);
    cast(t.game, spell, { settle: false });
    t.game.dispatch({ type: "pass-priority", player: A });
    cast(t.game, toHand(t.game, "Unified Will", B), { player: B, targets: [{ kind: "object", object: spell }] });
    return zone(t.game, spell);
  };

  it("counters on more", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Grizzly Bears", B);
    expect(answered(t)).toBe("graveyard");
  });

  it("does nothing on the same number (the ruling)", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Grizzly Bears", A);
    spawn(t.game, "Grizzly Bears", B);
    expect(answered(t)).toBe("battlefield");
  });

  it("compares with that spell's controller, not with each opponent", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Grizzly Bears", B);
    spawn(t.game, "Grizzly Bears", C);
    spawn(t.game, "Grizzly Bears", C);
    expect(answered(t)).toBe("graveyard");
  });

  it("does nothing against your own spell (you don't control more than yourself)", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Grizzly Bears", A);
    lands(t.game, "Forest", 2, A);
    lands(t.game, "Island", 2, A);
    const spell = toHand(t.game, "Grizzly Bears", A);
    cast(t.game, spell, { settle: false });
    cast(t.game, toHand(t.game, "Unified Will", A), { targets: [{ kind: "object", object: spell }] });
    expect(zone(t.game, spell)).toBe("battlefield");
  });
});

describe("more creatures of that type than each other player (Peer Pressure)", () => {
  const cast4 = (t: Table): void => {
    lands(t.game, "Island", 4);
    t.a.chooseCreatureTypeFn = () => "Bear";
    cast(t.game, toHand(t.game, "Peer Pressure"));
  };

  it("takes every creature of the type when strictly ahead of each", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Grizzly Bears", A);
    spawn(t.game, "Grizzly Bears", A);
    const bobs = spawn(t.game, "Grizzly Bears", B);
    const carols = spawn(t.game, "Grizzly Bears", C);
    const elf = spawn(t.game, "Llanowar Elves", B);
    cast4(t);
    expect(controller(t.game, bobs)).toBe(A);
    expect(controller(t.game, carols)).toBe(A);
    expect(controller(t.game, elf)).toBe(B);
  });

  it("takes nothing on a tie with one of them", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Grizzly Bears", A);
    spawn(t.game, "Grizzly Bears", A);
    const bobs = spawn(t.game, "Grizzly Bears", B);
    spawn(t.game, "Grizzly Bears", C);
    spawn(t.game, "Grizzly Bears", C);
    cast4(t);
    expect(controller(t.game, bobs)).toBe(B);
  });

  it("counts creatures of that type, not all creatures", () => {
    const t = table({ players: 2 });
    spawn(t.game, "Grizzly Bears", A);
    const bobs = spawn(t.game, "Grizzly Bears", B);
    spawn(t.game, "Llanowar Elves", B);
    spawn(t.game, "Llanowar Elves", A);
    spawn(t.game, "Llanowar Elves", A);
    cast4(t);
    expect(controller(t.game, bobs)).toBe(B);
  });
});

describe("its controller controls no other creatures", () => {
  const aura = (t: Table, host: ObjectId): void => {
    lands(t.game, "Swamp", 1);
    cast(t.game, toHand(t.game, "Predator's Gambit"), { targets: [{ kind: "object", object: host }] });
  };

  it("Predator's Gambit: intimidate while its controller has no other creature", () => {
    const t = table();
    const host = spawn(t.game, "Grizzly Bears", A);
    aura(t, host);
    expect(pt(t.game, host)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(t.game, host).has("intimidate")).toBe(true);
    spawn(t.game, "Llanowar Elves", A);
    expect(keywords(t.game, host).has("intimidate")).toBe(false);
  });

  it("Predator's Gambit reads the creature's controller, not the Aura's", () => {
    const t = table();
    const host = spawn(t.game, "Grizzly Bears", B);
    spawn(t.game, "Llanowar Elves", A); // Alice's other creature isn't Bob's.
    aura(t, host);
    expect(keywords(t.game, host).has("intimidate")).toBe(true);
    spawn(t.game, "Llanowar Elves", B);
    expect(keywords(t.game, host).has("intimidate")).toBe(false);
  });

  const killer = (t: Table, target: ObjectId): void => {
    lands(t.game, "Swamp", 4);
    pickTargets(t.a, target);
    cast(t.game, toHand(t.game, "Skulking Killer"));
  };

  it("Skulking Killer: -2/-2 when that opponent has only it", () => {
    const t = table({ players: 3 });
    const target = spawn(t.game, "Gray Ogre", B);
    spawn(t.game, "Grizzly Bears", C); // Another opponent's creature doesn't matter.
    killer(t, target);
    expect(zone(t.game, target)).toBe("graveyard");
  });

  it("Skulking Killer: nothing when that opponent has another", () => {
    const t = table();
    const target = spawn(t.game, "Gray Ogre", B);
    spawn(t.game, "Grizzly Bears", B);
    killer(t, target);
    expect(pt(t.game, target)).toEqual({ power: 2, toughness: 2 });
    expect(zone(t.game, target)).toBe("battlefield");
  });
});
