/**
 * An effect saying an attacker becomes blocked (rule 509.1h), the
 * `become-blocked` effect, and "blocks or becomes blocked by a creature" with a
 * filter on that creature, on the trigger object of `blocks`' `object:
 * "blocked"` and `blocked-by`'s `blocker`, printed and granted.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  grant,
  keywords,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** The declare blockers step, with `player` holding priority. */
const toBlockersPriority = (game: Game, player: PlayerId): void =>
  game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.priority.holder === player);

const blockedEvents = (game: Game): number =>
  game.state.eventLog.filter((e) => e.type === "attacker-blocked").length;

describe("Fog Patch", () => {
  it("stops every attacker, one that can't be blocked too, and each is blocked with nothing blocking it", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const phantom = spawn(game, "Phantom Warrior");
    a.declareAttackersFn = () => [giant, phantom].map((attacker) => ({ attacker, defender: B }));
    lands(game, "Forest", 2, B);
    const patch = toHand(game, "Fog Patch", B);
    toBlockersPriority(game, B);
    const before = life(game, B);
    cast(game, patch, { player: B });
    expect(game.state.objects[giant].blocked).toBe(true);
    expect(game.state.objects[giant].blockedBy).toEqual([]);
    expect(game.state.objects[phantom].blocked).toBe(true);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before);
  });

  it("lets trample through: all of it goes to the player (rule 702.19e)", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    grant(game, giant, "trample");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    lands(game, "Forest", 2, B);
    const patch = toHand(game, "Fog Patch", B);
    toBlockersPriority(game, B);
    const before = life(game, B);
    cast(game, patch, { player: B });
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before - 3);
  });

  it("can only be cast in the declare blockers step", () => {
    const { game } = table({ players: 2 });
    lands(game, "Forest", 2);
    const patch = toHand(game, "Fog Patch");
    expect(() => cast(game, patch)).toThrow();
  });

  it("reaches attackers aimed at another player, in a multiplayer game", () => {
    const { game, a } = table({ players: 3 });
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: C },
    ];
    lands(game, "Forest", 2, C);
    const patch = toHand(game, "Fog Patch", C);
    toBlockersPriority(game, C);
    const [bob, carol] = [life(game, B), life(game, C)];
    cast(game, patch, { player: C });
    toStep(game, "postcombat-main");
    expect([life(game, B), life(game, C)]).toEqual([bob, carol]);
  });
});

describe("the triggers on an effect's block", () => {
  it("'becomes blocked' fires for one that was unblocked, and not again for one already blocked (509.3c)", () => {
    const { game, a, b } = table();
    const berserker = spawn(game, "Elvish Berserker");
    const giant = spawn(game, "Hill Giant");
    const wall = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [berserker, giant].map((attacker) => ({ attacker, defender: B }));
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    lands(game, "Forest", 3, B);
    const vines = toHand(game, "Choking Vines", B);
    toBlockersPriority(game, B);
    expect(blockedEvents(game)).toBe(1);
    cast(game, vines, { player: B, x: 2, targets: [ref(berserker), ref(giant)] });
    // The giant's own block is the only one before; the berserker's joins it.
    expect(blockedEvents(game)).toBe(2);
  });

  it("'becomes blocked by a creature' doesn't: no creature blocked it (509.3d)", () => {
    const { game, a } = table();
    const hound = spawn(game, "Ashmouth Hound");
    a.declareAttackersFn = () => [{ attacker: hound, defender: B }];
    lands(game, "Forest", 2, B);
    const patch = toHand(game, "Fog Patch", B);
    toBlockersPriority(game, B);
    cast(game, patch, { player: B });
    expect(game.state.objects[hound].blocked).toBe(true);
    expect(game.state.zones.shared.stack).toEqual([]);
  });
});

describe("Choking Vines", () => {
  it("blocks X attackers and deals 1 to each, a blocked one kept as it was", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves");
    const wall = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [giant, bears, elf].map((attacker) => ({ attacker, defender: B }));
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    game.state.objects[elf].summoningSick = false;
    lands(game, "Forest", 3, B);
    const vines = toHand(game, "Choking Vines", B);
    toBlockersPriority(game, B);
    cast(game, vines, { player: B, x: 2, targets: [ref(giant), ref(elf)] });
    expect(game.state.objects[giant].blockedBy).toEqual([wall]);
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(zone(game, elf)).toBe("graveyard");
    expect(game.state.objects[bears].blocked).toBe(false);
  });
});

describe("Trap Runner", () => {
  it("makes an unblocked attacker blocked, only after blockers are declared, and never a blocked one", () => {
    const { game, a, b } = table();
    const runner = spawn(game, "Trap Runner", B);
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Grizzly Bears", B);
    a.declareAttackersFn = () => [giant, bears].map((attacker) => ({ attacker, defender: B }));
    b.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === B);
    expect(() => activate(game, runner, 0, { player: B, targets: [ref(giant)] })).toThrow();
    toBlockersPriority(game, B);
    expect(() => activate(game, runner, 0, { player: B, targets: [ref(giant)] })).toThrow();
    const before = life(game, B);
    activate(game, runner, 0, { player: B, targets: [ref(bears)] });
    expect(game.state.objects[bears].blocked).toBe(true);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(before);
    expect(game.state.objects[bears].blocked).toBe(false);
  });
});

describe("High-Rise Sawjack", () => {
  it("gets +2/+0 for blocking a creature with flying, and not for any other", () => {
    const { game, a, b } = table();
    const sawjack = spawn(game, "High-Rise Sawjack", B);
    const drake = spawn(game, "Wind Drake");
    a.declareAttackersFn = () => [{ attacker: drake, defender: B }];
    b.declareBlockersFn = () => [{ blocker: sawjack, attacker: drake }];
    toBlockersPriority(game, A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(pt(game, sawjack).power).toBe(4);

    const second = table();
    const other = spawn(second.game, "High-Rise Sawjack", B);
    const giant = spawn(second.game, "Hill Giant");
    second.a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    second.b.declareBlockersFn = () => [{ blocker: other, attacker: giant }];
    toBlockersPriority(second.game, A);
    second.game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(pt(second.game, other).power).toBe(2);
  });
});

describe("Barrow-Blade", () => {
  const equipped = (owner: PlayerId, creature: string) => {
    const t = table();
    const wearer = spawn(t.game, creature, owner);
    const blade = spawn(t.game, "Barrow-Blade", owner);
    t.game.state.objects[blade].attachedTo = wearer;
    return { ...t, wearer };
  };

  it("takes the abilities of what the equipped creature blocks", () => {
    const { game, a, b, wearer } = equipped(B, "Hill Giant");
    const drake = spawn(game, "Wind Drake");
    a.declareAttackersFn = () => [{ attacker: drake, defender: B }];
    b.declareBlockersFn = () => [{ blocker: wearer, attacker: drake }];
    grant(game, wearer, "reach");
    toBlockersPriority(game, A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(keywords(game, drake).has("flying")).toBe(false);
  });

  it("and of what blocks it, one creature at a time", () => {
    const { game, a, b, wearer } = equipped(A, "Hill Giant");
    const reach = spawn(game, "Deadly Recluse", B);
    const rats = spawn(game, "Typhoid Rats", B);
    a.declareAttackersFn = () => [{ attacker: wearer, defender: B }];
    b.declareBlockersFn = () => [
      { blocker: reach, attacker: wearer },
      { blocker: rats, attacker: wearer },
    ];
    toBlockersPriority(game, A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0);
    expect(keywords(game, reach).size).toBe(0);
    expect(keywords(game, rats).size).toBe(0);
  });
});

describe("Mirror Shield", () => {
  const shielded = (owner: PlayerId, creature: string) => {
    const t = table();
    const wearer = spawn(t.game, creature, owner);
    const shield = spawn(t.game, "Mirror Shield", owner);
    t.game.state.objects[shield].attachedTo = wearer;
    return { ...t, wearer, shield };
  };

  it("gives +0/+2 and hexproof", () => {
    const { game, wearer } = shielded(A, "Hill Giant");
    expect(pt(game, wearer)).toEqual({ power: 3, toughness: 5 });
    expect(keywords(game, wearer).has("hexproof")).toBe(true);
  });

  it("destroys a creature with deathtouch that blocks the equipped creature, before damage", () => {
    const { game, a, b, wearer } = shielded(A, "Hill Giant");
    const rats = spawn(game, "Typhoid Rats", B);
    a.declareAttackersFn = () => [{ attacker: wearer, defender: B }];
    b.declareBlockersFn = () => [{ blocker: rats, attacker: wearer }];
    attack(game, a, [wearer]);
    expect(zone(game, rats)).toBe("graveyard");
    expect(zone(game, wearer)).toBe("battlefield");
  });

  it("destroys a creature with deathtouch the equipped creature blocks, before damage", () => {
    const { game, a, b, wearer } = shielded(B, "Hill Giant");
    const rats = spawn(game, "Typhoid Rats");
    b.declareBlockersFn = () => [{ blocker: wearer, attacker: rats }];
    attack(game, a, [rats]);
    expect(zone(game, rats)).toBe("graveyard");
    expect(zone(game, wearer)).toBe("battlefield");
  });

  it("leaves any other creature alone", () => {
    const { game, a, b, wearer } = shielded(A, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: wearer }];
    a.declareAttackersFn = () => [{ attacker: wearer, defender: B }];
    toBlockersPriority(game, A);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("is gone with the Equipment: the creature no longer has the trigger", () => {
    const { game, a, b, wearer, shield } = shielded(A, "Hill Giant");
    game.state.objects[shield].attachedTo = null;
    const rats = spawn(game, "Typhoid Rats", B);
    b.declareBlockersFn = () => [{ blocker: rats, attacker: wearer }];
    a.declareAttackersFn = () => [{ attacker: wearer, defender: B }];
    toBlockersPriority(game, A);
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(zone(game, rats)).toBe("battlefield");
  });
});
