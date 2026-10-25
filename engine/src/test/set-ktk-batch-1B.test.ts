import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  controller,
  zone,
} from "./harness.js";

/** Batch 157 group B: Commander 2014 and Khans of Tarkir. */

describe("Wake the Dead", () => {
  it("can't be cast on your own turn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bears = toGraveyard(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Wake the Dead"), { x: 1, targets: [{ kind: "object", object: bears }] })).toThrow();
  });

  it("returns X creature cards during an opponent's combat and sacrifices them at the next end step", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const one = toGraveyard(game, "Grizzly Bears");
    const two = toGraveyard(game, "Hill Giant");
    const wake = toHand(game, "Wake the Dead");
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "begin-combat" && s.priority.holder === A);
    cast(game, wake, {
      x: 2,
      targets: [
        { kind: "object", object: one },
        { kind: "object", object: two },
      ],
    });
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("battlefield");
    game.advanceUntil((s) => s.turn.step === "cleanup" || (s.turn.step === "end" && s.zones.shared.stack.length > 0));
    settle(game);
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, two)).toBe("graveyard");
  });
});

describe("See the Unwritten", () => {
  it("puts one creature onto the battlefield, or two with ferocious, and the rest into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Hill Giant");
    let max = -1;
    a.chooseFromZoneFn = (_view, _eligible, _min, m) => {
      max = m;
      return [one];
    };
    cast(game, toHand(game, "See the Unwritten"));
    expect(max).toBe(1);
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("graveyard");
    expect(graveyard(game).length).toBe(8);
  });

  it("with ferocious, both chosen creatures enter", () => {
    const { game, a } = table();
    lands(game, "Forest", 6);
    spawn(game, "Craw Wurm");
    const one = toLibrary(game, "Grizzly Bears");
    const two = toLibrary(game, "Hill Giant");
    let max = -1;
    a.chooseFromZoneFn = (_view, _eligible, _min, m) => {
      max = m;
      return [one, two];
    };
    cast(game, toHand(game, "See the Unwritten"));
    expect(max).toBe(2);
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("battlefield");
  });
});

describe("Empty the Pits", () => {
  it("delves for its {X}{X} and makes X tapped Zombies", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const yard = [toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes")];
    cast(game, toHand(game, "Empty the Pits"), { x: 2, delve: yard });
    const zombies = Object.values(game.state.objects).filter(
      (o) => o.cardName === "Zombie Token" && o.zone === "battlefield",
    );
    expect(zombies.reduce((n, o) => n + (o.stackCount ?? 1), 0)).toBe(2);
    expect(zombies.every((o) => o.tapped)).toBe(true);
    for (const id of yard) expect(zone(game, id)).toBe("exile");
  });
});

describe("Butcher of the Horde", () => {
  it("sacrifices another creature and gains the chosen keyword", () => {
    const { game, a } = table();
    const butcher = spawn(game, "Butcher of the Horde");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 2);
    game.dispatch({ type: "activate-ability", player: A, source: butcher, abilityIndex: 0, targets: [], sacrifice: bears } as Action);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(keywords(game, butcher).has("haste")).toBe(true);
    expect(keywords(game, butcher).has("lifelink")).toBe(false);
  });
});

describe("Jeering Instigator", () => {
  it("turned face up on your turn, steals another creature, untapped and hasty", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const instigator = toHand(game, "Jeering Instigator");
    cast(game, instigator, { via: "face-down" });
    pickTargets(a, bears);
    game.dispatch({ type: "turn-face-up", player: A, permanent: instigator, morph: true } as Action);
    settle(game);
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Bellowing Saddlebrute", () => {
  it("loses 4 life unless you attacked this turn", () => {
    const { game } = table();
    enter(game, "Bellowing Saddlebrute");
    expect(life(game, A)).toBe(16);
  });
});

describe("Quiet Contemplation", () => {
  it("pays {1} to tap an opponent's creature when you cast a noncreature spell", () => {
    const { game, a } = table();
    spawn(game, "Quiet Contemplation");
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    cast(game, toHand(game, "Opt"));
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Briber's Purse", () => {
  it("enters with X gem counters and spends one per activation", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const purse = toHand(game, "Briber's Purse");
    cast(game, purse, { x: 2 });
    expect(counters(game, purse, "gem")).toBe(2);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, purse, 0, { targets: [{ kind: "object", object: bears }] });
    expect(counters(game, purse, "gem")).toBe(1);
  });
});
