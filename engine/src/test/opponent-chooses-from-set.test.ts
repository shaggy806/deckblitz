/**
 * A chooser other than the controller: another player picks from what the
 * controller found or revealed (`search-library`'s `instead.chooser`,
 * `look-and-choose`'s `chooser: "an-opponent"`), from a graveyard (`chooser`,
 * `player`, `under`), each opponent in turn with the cards entering together
 * (`for-each-player`'s `choicesHeld`), or from a revealed hand
 * (`discard-chosen`'s `chooser`).
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  C,
  D,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  lands,
  pickFromZone,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Intuition: the target opponent chooses among the finds", () => {
  it("hands the choice to them, who sees the finds; one to hand, the rest to the graveyard", () => {
    const { game, a, b } = table();
    lands(game, "Island", 3);
    const bear = toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    const opt = toLibrary(game, "Opt");
    pickTargets(a, B);
    pickFromZone(a, bear, ring, opt);
    let offered: readonly ObjectId[] = [];
    let seenName: string | undefined;
    let forPlayer: unknown;
    b.chooseFromZoneFn = (view, eligible) => {
      offered = eligible;
      const awaiting = view.state.awaiting;
      forPlayer = awaiting?.kind === "choose-from-zone" ? awaiting.forPlayer : undefined;
      seenName = viewFor(game.state, game.registry, B).objects[ring]?.cardName;
      return [ring];
    };
    const library = game.state.zones.perPlayer[A].library.length;
    cast(game, toHand(game, "Intuition"), { targets: [ref(B)] });
    expect([...offered].sort()).toEqual([bear, opt, ring].sort());
    expect(forPlayer).toBe(A);
    expect(seenName).toBe("Sol Ring");
    expect(zone(game, ring)).toBe("hand");
    expect(game.state.objects[ring].owner).toBe(A);
    expect(hand(game)).toContain(ring);
    expect(graveyard(game)).toContain(bear);
    expect(graveyard(game)).toContain(opt);
    expect(game.state.zones.perPlayer[A].library.length).toBe(library - 3);
  });
});

describe("Gifts Ungiven: two of up to four, different names", () => {
  it("the opponent's two go to the graveyard and the rest to hand", () => {
    const { game, a, b } = table();
    lands(game, "Island", 4);
    const cards = ["Grizzly Bears", "Sol Ring", "Opt", "Mind Stone"].map((name) => toLibrary(game, name));
    pickTargets(a, B);
    pickFromZone(a, ...cards);
    const seen = pickFromZone(b, cards[0], cards[1]);
    cast(game, toHand(game, "Gifts Ungiven"), { targets: [ref(B)] });
    expect(seen.offered.length).toBe(4);
    expect(zone(game, cards[0])).toBe("graveyard");
    expect(zone(game, cards[1])).toBe("graveyard");
    expect(zone(game, cards[2])).toBe("hand");
    expect(zone(game, cards[3])).toBe("hand");
  });

  it("refuses two finds with one name", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Grizzly Bears");
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [one, two] })).not.toBeNull();
      return [one];
    };
    pickTargets(a, B);
    cast(game, toHand(game, "Gifts Ungiven"), { targets: [ref(B)] });
    expect(asked).toBe(true);
  });

  it("two finds: nothing to ask, both to the graveyard (the ruling)", () => {
    const { game, a, b } = table();
    lands(game, "Island", 4);
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Sol Ring");
    pickFromZone(a, one, two);
    let asked = false;
    b.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    pickTargets(a, B);
    cast(game, toHand(game, "Gifts Ungiven"), { targets: [ref(B)] });
    expect(asked).toBe(false);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
  });
});

describe("Realms Uncharted: an opponent, the caster's choice with the finds in view", () => {
  const finds = ["Forest", "Island", "Swamp"];

  it("with one opponent nobody is asked who", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 3);
    const [forest, island, swamp] = finds.map((name) => toLibrary(game, name));
    pickFromZone(a, forest, island, swamp);
    pickFromZone(b, forest, island);
    cast(game, toHand(game, "Realms Uncharted"));
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, island)).toBe("graveyard");
    expect(zone(game, swamp)).toBe("hand");
  });

  it("with three, the caster picks who after finding, and only they are asked", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    lands(game, "Forest", 3);
    const [forest, island, swamp] = finds.map((name) => toLibrary(game, name));
    const order: string[] = [];
    a.chooseFromZoneFn = () => {
      order.push("found");
      return [forest, island, swamp];
    };
    a.chooseModesFn = (_view, _min, _max, modes) => {
      order.push("who");
      expect(modes?.length).toBe(3);
      return [1];
    };
    c.chooseFromZoneFn = () => {
      order.push("carol");
      return [island, swamp];
    };
    const refuse = () => {
      throw new Error("the wrong opponent was asked");
    };
    b.chooseFromZoneFn = refuse;
    d.chooseFromZoneFn = refuse;
    cast(game, toHand(game, "Realms Uncharted"));
    expect(order).toEqual(["found", "who", "carol"]);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, island)).toBe("graveyard");
    expect(game.state.zones.perPlayer[C].graveyard).not.toContain(island);
  });
});

describe("Guided Passage: an opponent takes a card a slot from the revealed library", () => {
  const passageMana = (game: ReturnType<typeof table>["game"]): void => {
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
  };

  it("offers the whole library's slots and the picks go to your hand, then a shuffle", () => {
    const { game, a, b } = table({ deck: "Wastes" });
    passageMana(game);
    const bear = toLibrary(game, "Grizzly Bears");
    const ring = toLibrary(game, "Sol Ring");
    const wastes = game.state.zones.perPlayer[A].library[0];
    a.chooseFromZoneFn = () => {
      throw new Error("the caster doesn't choose");
    };
    let min = -1;
    b.chooseFromZoneFn = (_view, _eligible, least) => {
      min = least;
      return [bear, ring, wastes];
    };
    cast(game, toHand(game, "Guided Passage"));
    expect(min).toBe(3);
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, wastes)).toBe("hand");
  });

  it("a slot no card fills is ignored (the ruling): the least is what can be filled", () => {
    const { game, b } = table({ deck: "Wastes" });
    passageMana(game);
    let least = -1;
    const wastes = game.state.zones.perPlayer[A].library[0];
    const other = game.state.zones.perPlayer[A].library[1];
    b.chooseFromZoneFn = (_view, _eligible, min) => {
      least = min;
      // Two lands fill only the one slot.
      expect(game.canDispatch({ type: "choose-from-zone", player: B, chosen: [wastes, other] })).not.toBeNull();
      return [wastes];
    };
    cast(game, toHand(game, "Guided Passage"));
    expect(least).toBe(1);
    expect(zone(game, wastes)).toBe("hand");
  });
});

describe("Dubious Challenge: the target opponent may take one of the exiled cards", () => {
  const challenge = () => {
    const t = table();
    lands(t.game, "Forest", 4);
    const bear = toLibrary(t.game, "Grizzly Bears");
    const giant = toLibrary(t.game, "Hill Giant");
    const library = t.game.state.zones.perPlayer[A].library;
    library.splice(0, library.length, bear, giant, ...library.filter((id) => id !== bear && id !== giant));
    return { ...t, bear, giant };
  };

  it("they take one under their control and the other comes to you", () => {
    const { game, a, b, bear, giant } = challenge();
    pickTargets(a, B);
    const answers: (readonly ObjectId[])[] = [[bear, giant], [giant]];
    a.chooseFromZoneFn = () => answers.shift() ?? [];
    const seen = pickFromZone(b, bear);
    cast(game, toHand(game, "Dubious Challenge"), { targets: [ref(B)] });
    expect([...seen.offered].sort()).toEqual([bear, giant].sort());
    expect(controller(game, bear)).toBe(B);
    expect(zone(game, bear)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("if they decline, both come to you", () => {
    const { game, a, b, bear, giant } = challenge();
    pickTargets(a, B);
    let round = 0;
    a.chooseFromZoneFn = () => (round++ === 0 ? [bear, giant] : [bear, giant]);
    pickFromZone(b);
    cast(game, toHand(game, "Dubious Challenge"), { targets: [ref(B)] });
    expect(controller(game, bear)).toBe(A);
    expect(controller(game, giant)).toBe(A);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Drana, the Last Bloodchief: the defending player chooses in your graveyard", () => {
  it("they pick a nonlegendary creature, and it returns with a counter as a Vampire", () => {
    const { game, a, b } = table();
    const drana = spawn(game, "Drana, the Last Bloodchief");
    const bear = toGraveyard(game, "Grizzly Bears");
    const serra = toGraveyard(game, "Serra Angel");
    const legend = toGraveyard(game, "Isamaru, Hound of Konda");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    const seen = pickFromZone(b, bear);
    attack(game, a, [drana], B);
    game.advanceUntil(() => zone(game, bear) === "battlefield");
    expect(seen.offered).toEqual([bear, serra]);
    expect(seen.offered).not.toContain(legend);
    expect(seen.offered).not.toContain(theirs);
    expect(controller(game, bear)).toBe(A);
    expect(counters(game, bear)).toBe(1);
    expect(subtypes(game, bear)).toContain("Vampire");
    expect(subtypes(game, bear)).toContain("Bear");
  });
});

describe("Scrounge: the target opponent chooses in their graveyard, under your control", () => {
  it("comes to you, and stays when it would have gone to them", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 3);
    const ring = toGraveyard(game, "Sol Ring", B);
    const stone = toGraveyard(game, "Mind Stone", B);
    const bear = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, B);
    const seen = pickFromZone(b, stone);
    cast(game, toHand(game, "Scrounge"), { targets: [ref(B)] });
    expect([...seen.offered].sort()).toEqual([ring, stone].sort());
    expect(seen.offered).not.toContain(bear);
    expect(zone(game, stone)).toBe("battlefield");
    expect(controller(game, stone)).toBe(A);
    expect(game.state.objects[stone].owner).toBe(B);
  });
});

describe("Dredge the Mire: each opponent chooses, and they enter together", () => {
  it("nothing enters until the last has chosen, all under your control, all in one event", () => {
    const { game, b, c, d } = table({ players: 4 });
    lands(game, "Swamp", 4);
    const bbear = toGraveyard(game, "Grizzly Bears", B);
    const cbear = toGraveyard(game, "Grizzly Bears", C);
    const dbear = toGraveyard(game, "Grizzly Bears", D);
    const order: string[] = [];
    const pick = (name: string, id: ObjectId) => () => {
      order.push(name);
      for (const other of [bbear, cbear, dbear]) expect(zone(game, other)).toBe("graveyard");
      return [id];
    };
    b.chooseFromZoneFn = pick("bob", bbear);
    c.chooseFromZoneFn = pick("carol", cbear);
    d.chooseFromZoneFn = pick("dave", dbear);
    cast(game, toHand(game, "Dredge the Mire"));
    expect(order).toEqual(["bob", "carol", "dave"]);
    for (const bear of [bbear, cbear, dbear]) {
      expect(zone(game, bear)).toBe("battlefield");
      expect(controller(game, bear)).toBe(A);
    }
  });

  it("an opponent with nothing to choose is simply passed over", () => {
    const { game, b } = table({ players: 4 });
    lands(game, "Swamp", 4);
    const bear = toGraveyard(game, "Grizzly Bears", B);
    pickFromZone(b, bear);
    cast(game, toHand(game, "Dredge the Mire"));
    expect(zone(game, bear)).toBe("battlefield");
    expect(controller(game, bear)).toBe(A);
    expect(game.state.heldChoices).toBeUndefined();
  });
});

describe("Rejoin the Fight: each opponent, a card no one has chosen", () => {
  it("the next opponent's offer leaves out what's been chosen", () => {
    const { game, b, c, d } = table({ players: 4 });
    lands(game, "Swamp", 6);
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Serra Angel");
    const three = toGraveyard(game, "Hill Giant");
    pickFromZone(b, one);
    const carol = pickFromZone(c, two);
    const dave = pickFromZone(d, three);
    cast(game, toHand(game, "Rejoin the Fight"));
    expect(carol.offered).not.toContain(one);
    expect(dave.offered).not.toContain(one);
    expect(dave.offered).not.toContain(two);
    for (const id of [one, two, three]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(controller(game, id)).toBe(A);
    }
  });
});

describe("Rakdos Augermage: discard a card of target opponent's choice", () => {
  it("they choose from your revealed hand, you discard it; then the other way round", () => {
    const { game, a, b } = table();
    const mage = spawn(game, "Rakdos Augermage");
    const mine = toHand(game, "Grizzly Bears");
    const theirs = toHand(game, "Opt", B);
    pickFromZone(b, mine);
    pickFromZone(a, theirs);
    activate(game, mage, 0, { targets: [ref(B)] });
    settle(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(game.state.objects[mine].owner).toBe(A);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Skullwinder: then the chosen opponent returns a card of theirs", () => {
  it("your target first, then they pick from their own graveyard", () => {
    const { game, a, b } = table();
    const mine = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Opt", B);
    const theirs2 = toGraveyard(game, "Sol Ring", B);
    pickTargets(a, mine);
    const seen = pickFromZone(b, theirs2);
    enter(game, "Skullwinder");
    settle(game);
    expect(zone(game, mine)).toBe("hand");
    expect([...seen.offered].sort()).toEqual([theirs, theirs2].sort());
    expect(zone(game, theirs2)).toBe("hand");
    expect(game.state.zones.perPlayer[B].hand).toContain(theirs2);
  });
});
