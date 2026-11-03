/**
 * Tokens linked to what made them. A token holding the card its ability calls
 * "the exiled card" (`link-exiled-to-created`, `GameObject.linkedExile`): Hofri
 * Ghostforge's Spirit, Timothar, Baron of Bats's Bat. A delayed trigger watching
 * "that token" (`DelayedLeaves.leaves: "created"`): Ugin, the Ineffable's "put
 * the exiled card into your hand", Stangg's Twin and its "exile that token when
 * Stangg leaves".
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  loyalty,
  named,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Table } from "./harness.js";

const toExile = (game: Game, id: ObjectId, by = B): void => {
  game.debugApplyEffect(by, { kind: "exile", target: 0 }, [ref(id)]);
  settle(game);
};

const bounce = (game: Game, id: ObjectId, by = B): void => {
  game.debugApplyEffect(by, { kind: "return-to-hand", target: 0 }, [ref(id)]);
  settle(game);
};

const steal = (game: Game, id: ObjectId): void => {
  game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(id)]);
  settle(game);
};

describe("Hofri Ghostforge", () => {
  const withHofri = (): Table & { dead: ObjectId } => {
    const t = table();
    spawn(t.game, "Hofri Ghostforge");
    const dead = spawn(t.game, "Grizzly Bears");
    return { ...t, dead };
  };

  /** The Spirit copy of the Bears, the only Bears on the battlefield. */
  const spirit = (game: Game): ObjectId => named(game, "Grizzly Bears").filter((id) => zone(game, id) === "battlefield")[0];

  it("exiles what dies and makes a Spirit copy of it, which Hofri pumps", () => {
    const { game, dead } = withHofri();
    destroy(game, dead);
    expect(zone(game, dead)).toBe("exile");
    const token = spirit(game);
    expect(game.state.objects[token].isToken).toBe(true);
    expect(subtypes(game, token)).toEqual(expect.arrayContaining(["Bear", "Spirit"]));
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, token).has("trample")).toBe(true);
    expect(keywords(game, token).has("haste")).toBe(true);
  });

  it("returns the card to its owner's graveyard when the token leaves, for any reason", () => {
    const { game, dead } = withHofri();
    destroy(game, dead);
    bounce(game, spirit(game));
    expect(zone(game, dead)).toBe("graveyard");
    expect(game.state.objects[dead].owner).toBe(A);
    expect(graveyard(game)).toContain(dead);
  });

  it("returns only that token's card, not another Hofri exiled", () => {
    const { game, dead } = withHofri();
    const other = spawn(game, "Hill Giant");
    destroy(game, dead);
    destroy(game, other);
    const bears = spirit(game);
    destroy(game, bears);
    expect(zone(game, dead)).toBe("graveyard");
    expect(zone(game, other)).toBe("exile");
  });

  it("with two tokens from one death, whichever leaves first returns the card (the ruling)", () => {
    const { game, dead } = withHofri();
    spawn(game, "Doubling Season");
    destroy(game, dead);
    const spirits = named(game, "Grizzly Bears").filter((id) => zone(game, id) === "battlefield");
    expect(spirits.length).toBe(2);
    destroy(game, spirits[1]);
    expect(zone(game, dead)).toBe("graveyard");
    expect(zone(game, spirits[0])).toBe("battlefield");
    destroy(game, spirits[0]);
    expect(zone(game, dead)).toBe("graveyard");
  });

  it("two Spirits of the same card holding different cards never fold together", () => {
    const { game, dead } = withHofri();
    const second = spawn(game, "Grizzly Bears");
    destroy(game, dead);
    destroy(game, second);
    toStep(game, "precombat-main");
    const spirits = named(game, "Grizzly Bears").filter((id) => zone(game, id) === "battlefield");
    expect(spirits.length).toBe(2);
    destroy(game, spirits[1]);
    expect([zone(game, dead), zone(game, second)].sort()).toEqual(["exile", "graveyard"]);
  });

  it("a token's copy has the ability but isn't linked (the ruling)", () => {
    const { game, dead } = withHofri();
    destroy(game, dead);
    const token = spirit(game);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(token)]);
    settle(game);
    const copy = named(game, "Grizzly Bears").filter((id) => zone(game, id) === "battlefield" && id !== token)[0];
    expect(subtypes(game, copy)).toContain("Spirit");
    destroy(game, copy);
    expect(zone(game, dead)).toBe("exile");
    destroy(game, token);
    expect(zone(game, dead)).toBe("graveyard");
  });

  it("makes no token if the card has gone before it resolves (the ruling)", () => {
    const { game, dead } = withHofri();
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(dead)]);
    // Exiled from the graveyard in response, as the trigger waits.
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(dead)]);
    settle(game);
    expect(zone(game, dead)).toBe("exile");
    expect(named(game, "Grizzly Bears").filter((id) => zone(game, id) === "battlefield")).toEqual([]);
  });

  it("doesn't see a token die, nor an opponent's creature", () => {
    const { game, dead } = withHofri();
    destroy(game, dead);
    destroy(game, spirit(game));
    expect(named(game, "Grizzly Bears").filter((id) => zone(game, id) === "battlefield")).toEqual([]);
    const theirs = spawn(game, "Hill Giant", B);
    destroy(game, theirs);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("copies what a stolen creature was, and returns the card to its owner", () => {
    const t = table();
    spawn(t.game, "Hofri Ghostforge");
    const theirs = spawn(t.game, "Grizzly Bears", B);
    t.game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(theirs)]);
    settle(t.game);
    destroy(t.game, theirs);
    expect(zone(t.game, theirs)).toBe("exile");
    destroy(t.game, spirit(t.game));
    expect(graveyard(t.game, B)).toContain(theirs);
  });
});

describe("Timothar, Baron of Bats", () => {
  const withTimothar = (): Table & { vampire: ObjectId } => {
    const t = table();
    spawn(t.game, "Timothar, Baron of Bats");
    lands(t.game, "Wastes", 1);
    const vampire = spawn(t.game, "Vampire Nighthawk");
    t.a.chooseModesFn = () => [0];
    return { ...t, vampire };
  };

  const hitWithBat = (t: Table): ObjectId => {
    const bat = named(t.game, "Bat Token")[0];
    t.game.state.objects[bat].summoningSick = false;
    t.a.declareAttackersFn = () => [{ attacker: bat, defender: B }];
    toStep(t.game, "postcombat-main");
    settle(t.game);
    return bat;
  };

  it("pays {1} and exiles it for a Bat with flying", () => {
    const { game, vampire } = withTimothar();
    destroy(game, vampire);
    expect(zone(game, vampire)).toBe("exile");
    expect(tokensNamed(game, "Bat Token")).toBe(1);
    expect(keywords(game, named(game, "Bat Token")[0]).has("flying")).toBe(true);
  });

  it("the Bat's combat damage sacrifices it and returns the card tapped", () => {
    const t = withTimothar();
    destroy(t.game, t.vampire);
    hitWithBat(t);
    expect(tokensNamed(t.game, "Bat Token")).toBe(0);
    expect(zone(t.game, t.vampire)).toBe("battlefield");
    expect(t.game.state.objects[t.vampire].tapped).toBe(true);
    expect(t.game.state.objects[t.vampire].controller).toBe(A);
  });

  it("declining or being unable to pay does nothing", () => {
    const t = table();
    spawn(t.game, "Timothar, Baron of Bats");
    const vampire = spawn(t.game, "Vampire Nighthawk");
    // No mana: the offer isn't made.
    let asked = 0;
    t.a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    destroy(t.game, vampire);
    expect(asked).toBe(0);
    expect(zone(t.game, vampire)).toBe("graveyard");
    expect(tokensNamed(t.game, "Bat Token")).toBe(0);
  });

  it("isn't offered once the card has gone (the ruling), so no {1} is paid", () => {
    const t = withTimothar();
    let asked = 0;
    t.a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    t.game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(t.vampire)]);
    // Exiled from the graveyard in response, as the trigger waits.
    t.game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(t.vampire)]);
    settle(t.game);
    expect(asked).toBe(0);
    expect(tokensNamed(t.game, "Bat Token")).toBe(0);
  });

  it("a Bat holds only its own card; a copy of it has no such ability (the rulings)", () => {
    const t = withTimothar();
    lands(t.game, "Wastes", 1);
    const other = spawn(t.game, "Vampire Nighthawk");
    destroy(t.game, t.vampire);
    destroy(t.game, other);
    const [first] = named(t.game, "Bat Token");
    t.game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(first)]);
    settle(t.game);
    const bats = named(t.game, "Bat Token");
    const copy = bats[bats.length - 1];
    expect(t.game.state.objects[copy].linkedExile).toBeUndefined();
    t.game.state.objects[first].summoningSick = false;
    t.a.declareAttackersFn = () => [{ attacker: first, defender: B }];
    toStep(t.game, "postcombat-main");
    settle(t.game);
    expect(zone(t.game, t.vampire)).toBe("battlefield");
    expect(zone(t.game, other)).toBe("exile");
  });

  it("returns the card under the player who controls the Bat by then (the ruling)", () => {
    const t = withTimothar();
    destroy(t.game, t.vampire);
    const bat = named(t.game, "Bat Token")[0];
    steal(t.game, bat);
    toStep(t.game, "precombat-main", B);
    t.game.state.objects[bat].summoningSick = false;
    t.b.declareAttackersFn = () => [{ attacker: bat, defender: A }];
    toStep(t.game, "postcombat-main", B);
    settle(t.game);
    expect(zone(t.game, t.vampire)).toBe("battlefield");
    expect(t.game.state.objects[t.vampire].controller).toBe(B);
    expect(t.game.state.objects[t.vampire].owner).toBe(A);
  });

  it("still sacrifices the Bat with the card gone (the ruling)", () => {
    const t = withTimothar();
    destroy(t.game, t.vampire);
    t.game.debugApplyEffect(B, { kind: "return-to-hand", target: 0, from: "exile" }, [ref(t.vampire)]);
    settle(t.game);
    expect(zone(t.game, t.vampire)).toBe("hand");
    hitWithBat(t);
    expect(tokensNamed(t.game, "Bat Token")).toBe(0);
    expect(zone(t.game, t.vampire)).toBe("hand");
  });

  it("has ward: discard a card", () => {
    const { game } = withTimothar();
    expect(game.registry.get("Timothar, Baron of Bats").triggered[0].effect).toEqual({
      kind: "ward",
      cost: { discard: 1 },
    });
  });
});

describe("Ugin, the Ineffable", () => {
  const SPIRIT = "Spirit Token (Ugin, the Ineffable)";
  const lastExiled = (game: Game): ObjectId => {
    const exile = game.state.zones.shared.exile;
    return exile[exile.length - 1];
  };
  /** A table with Ugin, activated once. `top` is the card it exiled. */
  const activated = (doubled = false): Table & { ugin: ObjectId; top: ObjectId } => {
    const t = table();
    const ugin = spawn(t.game, "Ugin, the Ineffable");
    if (doubled) spawn(t.game, "Doubling Season");
    loyalty(t.game, ugin, 1);
    return { ...t, ugin, top: lastExiled(t.game) };
  };

  it("+1 exiles the top card face down, looked at by you, and makes a 2/2 Spirit", () => {
    const { game, ugin, top } = activated();
    expect(counters(game, ugin, "loyalty")).toBe(5);
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[top].exiledFaceDown).toBeDefined();
    const token = named(game, SPIRIT)[0];
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
  });

  it("puts the card into your hand when the token leaves, Ugin gone or not (the ruling)", () => {
    const { game, ugin, top } = activated();
    toExile(game, ugin);
    expect(zone(game, top)).toBe("exile");
    destroy(game, named(game, SPIRIT)[0]);
    expect(zone(game, top)).toBe("hand");
    expect(hand(game)).toContain(top);
  });

  it("is about each token's own card (the ruling)", () => {
    const { game, ugin, top } = activated();
    toStep(game, "precombat-main");
    loyalty(game, ugin, 1);
    const second = lastExiled(game);
    expect(second).not.toBe(top);
    const spirits = named(game, SPIRIT);
    expect(spirits.length).toBe(2);
    bounce(game, spirits[1]);
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, top)).toBe("exile");
  });

  it("with two tokens from one activation, the first to leave gives you the card (the ruling)", () => {
    const { game, top } = activated(true);
    expect(tokensNamed(game, SPIRIT)).toBe(2);
    const spirits = named(game, SPIRIT);
    expect(spirits.length).toBe(2);
    destroy(game, spirits[1]);
    expect(zone(game, top)).toBe("hand");
    destroy(game, spirits[0]);
    expect(zone(game, top)).toBe("hand");
  });

  it("the trigger is yours, whoever controls the token by then (the ruling)", () => {
    const { game, top } = activated();
    const token = named(game, SPIRIT)[0];
    steal(game, token);
    destroy(game, token);
    expect(hand(game)).toContain(top);
  });

  it("−3 destroys a coloured permanent", () => {
    const t = table();
    const ugin = spawn(t.game, "Ugin, the Ineffable");
    const bears = spawn(t.game, "Grizzly Bears", B);
    loyalty(t.game, ugin, -3, { targets: [ref(bears)] });
    expect(zone(t.game, bears)).toBe("graveyard");
    expect(counters(t.game, ugin, "loyalty")).toBe(1);
  });

  it("makes colorless spells cost {2} less", () => {
    const t = table();
    spawn(t.game, "Ugin, the Ineffable");
    const stone = toHand(t.game, "Mind Stone");
    cast(t.game, stone);
    expect(zone(t.game, stone)).toBe("battlefield");
  });
});

describe("Tatsumasa, the Dragon's Fang", () => {
  const DRAGON = "Dragon Spirit Token (Tatsumasa)";
  const exiled = (): Table & { sword: ObjectId; dragon: ObjectId } => {
    const t = table();
    const sword = spawn(t.game, "Tatsumasa, the Dragon's Fang");
    lands(t.game, "Wastes", 6);
    activate(t.game, sword, 0);
    return { ...t, sword, dragon: named(t.game, DRAGON)[0] };
  };

  it("doesn't return once it has left exile (rule 400.7)", () => {
    const { game, sword, dragon } = exiled();
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0, from: "exile" }, [ref(sword)]);
    settle(game);
    expect(zone(game, sword)).toBe("hand");
    destroy(game, dragon);
    expect(zone(game, sword)).toBe("hand");
  });

  it("exiles itself as a cost for a 5/5 flier, and comes back when it dies", () => {
    const { game, sword, dragon } = exiled();
    expect(zone(game, sword)).toBe("exile");
    expect(pt(game, dragon)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, dragon).has("flying")).toBe(true);
    destroy(game, dragon);
    expect(zone(game, sword)).toBe("battlefield");
    expect(game.state.objects[sword].controller).toBe(A);
  });

  it("stays exiled if the token leaves any other way", () => {
    const { game, sword, dragon } = exiled();
    bounce(game, dragon);
    expect(zone(game, sword)).toBe("exile");
  });

  it("returns under its owner's control, whoever activated it", () => {
    const t = table();
    const sword = spawn(t.game, "Tatsumasa, the Dragon's Fang", B);
    t.game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(sword)]);
    settle(t.game);
    lands(t.game, "Wastes", 6);
    activate(t.game, sword, 0);
    destroy(t.game, named(t.game, DRAGON)[0]);
    expect(zone(t.game, sword)).toBe("battlefield");
    expect(t.game.state.objects[sword].controller).toBe(B);
  });

  it("gives +5/+5 to what it equips", () => {
    const t = table();
    const sword = spawn(t.game, "Tatsumasa, the Dragon's Fang");
    const bears = spawn(t.game, "Grizzly Bears");
    lands(t.game, "Wastes", 3);
    activate(t.game, sword, 1, { targets: [ref(bears)] });
    expect(pt(t.game, bears)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Stangg", () => {
  const withStangg = (): Table & { stangg: ObjectId; twin: ObjectId } => {
    const t = table();
    const stangg = enter(t.game, "Stangg");
    return { ...t, stangg, twin: named(t.game, "Stangg Twin")[0] };
  };

  it("makes the Twin, a legendary 3/4", () => {
    const { game, twin } = withStangg();
    expect(pt(game, twin)).toEqual({ power: 3, toughness: 4 });
    expect(game.state.objects[twin].isToken).toBe(true);
    expect(supertypes(game, twin)).toContain("legendary");
  });

  it("exiles the Twin when Stangg leaves, by any way", () => {
    const { game, stangg, twin } = withStangg();
    bounce(game, stangg);
    expect(zone(game, stangg)).toBe("hand");
    expect(game.state.objects[twin]?.zone ?? "gone").not.toBe("battlefield");
    expect(tokensNamed(game, "Stangg Twin")).toBe(0);
  });

  it("sacrifices Stangg when the Twin leaves", () => {
    const { game, stangg, twin } = withStangg();
    bounce(game, twin);
    expect(zone(game, stangg)).toBe("graveyard");
  });

  it("makes a Twin nothing exiles when Stangg left first (the ruling)", () => {
    const t = table();
    const stangg = enter(t.game, "Stangg", A, { settle: false });
    // Stangg goes in response to its own ability.
    t.game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(stangg)]);
    settle(t.game);
    expect(zone(t.game, stangg)).toBe("exile");
    expect(tokensNamed(t.game, "Stangg Twin")).toBe(1);
  });
});
