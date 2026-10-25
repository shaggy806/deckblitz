/**
 * Magic 2015 and Conspiracy (B158), group B. One test per card whose
 * behaviour is more than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Profane Memento", () => {
  it("gains 1 life when an opponent's creature card dies, not for its own", () => {
    const { game } = table();
    spawn(game, "Profane Memento");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, theirs);
    expect(life(game)).toBe(21);
    destroy(game, mine);
    expect(life(game)).toBe(21);
  });
});

describe("Leeching Sliver", () => {
  it("each attacking Sliver makes the defending player lose 1 life", () => {
    const { game, a } = table();
    const sliver = spawn(game, "Leeching Sliver");
    attack(game, a, [sliver]);
    expect(life(game, B)).toBe(20 - 1 - 1);
  });
});

describe("Avarice Amulet", () => {
  it("gives +2/+0 and vigilance, and goes to the target opponent when the creature dies", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const amulet = spawn(game, "Avarice Amulet");
    lands(game, "Wastes", 2);
    activate(game, amulet, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    pickTargets(a, B);
    destroy(game, bears);
    expect(controller(game, amulet)).toBe(B);
  });
});

describe("Mercurial Pretender", () => {
  it("copies a creature you control and has the bounce ability", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    a.chooseCopyFn = (_view, _source, options) => (options.includes(bears) ? bears : null);
    lands(game, "Island", 9);
    const pretender = toHand(game, "Mercurial Pretender");
    cast(game, pretender);
    expect(zone(game, pretender)).toBe("battlefield");
    expect(pt(game, pretender)).toEqual({ power: 2, toughness: 2 });
    activate(game, pretender, 0);
    expect(zone(game, pretender)).toBe("hand");
  });
});

describe("Glacial Crasher", () => {
  it("attacks while an opponent controls a Mountain", () => {
    const { game, a } = table();
    const crasher = spawn(game, "Glacial Crasher");
    spawn(game, "Mountain", B);
    attack(game, a, [crasher]);
    expect(life(game, B)).toBe(15);
  });

  it("can't attack with no Mountain on the battlefield", () => {
    const { game, a } = table();
    const crasher = spawn(game, "Glacial Crasher");
    attack(game, a, [crasher]);
    expect(game.state.objects[crasher].tapped).toBe(false);
    expect(life(game, B)).toBe(20);
  });
});

describe("Bite of the Black Rose", () => {
  it("sickness winning shrinks the opponents' creatures", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickModes(b, 0);
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Bite of the Black Rose"));
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a tie makes each opponent discard two", () => {
    const { game, a, b } = table();
    pickModes(a, 0);
    pickModes(b, 1);
    const before = hand(game, B).length;
    lands(game, "Swamp", 4);
    cast(game, toHand(game, "Bite of the Black Rose"));
    expect(hand(game, B).length).toBe(before - 2);
  });
});

describe("Flamewright", () => {
  it("makes a defender Construct, and sacrifices a defender to ping", () => {
    const { game } = table();
    const maker = spawn(game, "Flamewright");
    lands(game, "Wastes", 1);
    activate(game, maker, 0);
    expect(tokensNamed(game, "Construct Token (Defender)", A)).toBe(1);
    const construct = named(game, "Construct Token (Defender)", A)[0];
    const pinger = spawn(game, "Flamewright");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: pinger,
      abilityIndex: 1,
      targets: [ref(B)],
      sacrifice: construct,
    } as Action);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(life(game, B)).toBe(19);
  });
});
